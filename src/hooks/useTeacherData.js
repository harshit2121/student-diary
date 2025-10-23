import { useEffect, useMemo, useState } from "react";
import {
  collection, doc, getDoc, getDocs, onSnapshot, query,
  orderBy, limit, where,
} from "firebase/firestore";
import { db } from "../firebase";

const dkey = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function useTeacherData(uid) {
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [classKeys, setClassKeys] = useState([]); // ["10-A", "10-B"]
  const [classTotals, setClassTotals] = useState({}); // key -> total students count
  const [todayAgg, setTodayAgg] = useState({}); // key -> {present,total}
  const [weeklyAvg, setWeeklyAvg] = useState(0);
  const [activity, setActivity] = useState([]);
  const [studentsData, setStudentsData] = useState([]); // new: with attendance percentages

  useEffect(() => {
    if (!uid) return;
    let unsub = () => {};

    const run = async () => {
      setLoading(true);

      // Fetch teacher profile
      const u = await getDoc(doc(db, "users", uid));
      const profile = u.exists() ? { id: uid, ...u.data() } : null;
      setTeacher(profile);

      // Fetch all students and build class keys and totals
      const sSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      const keys = new Set();
      const totals = {};
      const allStudents = [];
      sSnap.forEach((d) => {
        const s = d.data();
        const g = String(s.class || "").trim();
        const sec = String(s.section || "").trim();
        if (!g || !sec) return;
        const key = `${g}-${sec}`;
        keys.add(key);
        totals[key] = (totals[key] || 0) + 1;
        allStudents.push({ id: d.id, name: s.name, class: g, section: sec });
      });
      const k = Array.from(keys).sort();
      setClassKeys(k);
      setClassTotals(totals);

      // Fetch today's attendance aggregates
      const today = dkey();
      const aggCol = collection(db, "attendance", today, "classes");
      const aggSnap = await getDocs(aggCol);
      const agg = {};
      aggSnap.forEach((r) => {
        agg[r.id] = { present: r.data().present || 0, total: r.data().total || 0 };
      });
      setTodayAgg(agg);

      // Compute weekly average attendance
      let sum = 0, c = 0;
      for (let i = 0; i < 7; i++) {
        const dt = new Date(); dt.setDate(dt.getDate() - i);
        const key = dkey(dt);
        const sub = collection(db, "attendance", key, "classes");
        const s = await getDocs(sub);
        s.forEach((r) => {
          const v = r.data();
          if (v?.total > 0) { sum += (v.present / v.total) * 100; c++; }
        });
      }
      setWeeklyAvg(c ? Math.round(sum / c) : 0);

      // Activity feed
      const aQ = query(collection(db, "activity"), orderBy("createdAt", "desc"), limit(20));
      unsub = onSnapshot(aQ, (snap) => {
        const rows = [];
        snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        setActivity(rows);
      });

      // Now calculate individual student attendance percentage over last 7 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      const attendPromises = allStudents.map(async (student) => {
        // Query attendance for this student over last 7 days
        // Assuming attendance collection structure supports student presence record per date
        const attendQuery = query(
          collection(db, 'attendance'),
          where('class', '==', student.class),
          where('section', '==', student.section),
          where('date', '>=', cutoffDate),
          where('studentsPresent', 'array-contains', student.id)
        );
        const snapshot = await getDocs(attendQuery);
        const attendedSessions = snapshot.size;

        // Total sessions for the class-section over last 7 days
        let totalSessions = 0;
        for (let i = 0; i < 7; i++) {
          const dt = new Date();
          dt.setDate(dt.getDate() - i);
          const dateKey = dkey(dt);
          const daySnapshot = await getDoc(doc(db, "attendance", dateKey, "classes", `${student.class}-${student.section}`));
          if (daySnapshot.exists()) totalSessions++;
        }
        const attendancePercent = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

        return {
          ...student,
          attendancePercent
        };
      });

      const detailedStudents = await Promise.all(attendPromises);
      setStudentsData(detailedStudents);

      setLoading(false);
    };
    run();

    return () => unsub();
  }, [uid]);

  const classWise = useMemo(() => {
    return classKeys.map((key) => {
      const name = `Class ${key}`;
      const total = todayAgg[key]?.total || classTotals[key] || 0;
      const present = todayAgg[key]?.present || 0;
      const pct = total ? Math.round((present / total) * 100) : 0;
      return { section: name, present, total, pct };
    });
  }, [classKeys, classTotals, todayAgg]);

  const kpis = useMemo(() => {
    let p = 0, t = 0, marked = 0;
    classKeys.forEach((key) => {
      const a = todayAgg[key];
      if (a) {
        p += a.present || 0;
        t += a.total || 0;
        marked += 1;
      } else {
        t += classTotals[key] || 0;
      }
    });
    const todayPct = t ? Math.round((p / t) * 100) : 0;
    return {
      todayPct,
      presentCount: `${p}/${t}`,
      weeklyAvg,
      classesToday: classKeys.length,
      markedCount: marked,
    };
  }, [classKeys, todayAgg, weeklyAvg, classTotals]);

  const activityView = useMemo(() => {
    return activity.map((a) => ({
      status: a.type === "absent" ? "absent" : "marked",
      cls: a.classId || "-",
      time: new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));
  }, [activity]);

  return { loading, teacher, kpis, classWise, activity: activityView, studentsData };
}
