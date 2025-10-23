import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

const toStr = (v) => String(v ?? "").trim();
const dkey = (d = new Date()) => new Date(d).toISOString().slice(0, 10);

export default function Attendance() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Options
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);

  // Filters
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [date, setDate] = useState(dkey());

  // Data
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) return setProfile(null);
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("uid", "==", u.uid))
        );
        const p = snap.docs[0]?.data() || null;
        setProfile(p || { name: u.displayName || "teacher" });
      } catch {
        setProfile({ name: u.displayName || "teacher" });
      }
    });
    return () => unsub();
  }, []);

  // Load class and section options
  useEffect(() => {
    const run = async () => {
      const snap = await getDocs(
        query(collection(db, "users"), where("role", "==", "student"))
      );
      const g = new Set(),
        s = new Set();
      snap.forEach((d) => {
        const v = d.data();
        if (v.class) g.add(toStr(v.class));
        if (v.section) s.add(toStr(v.section));
      });
      setGrades(Array.from(g).sort());
      setSections(Array.from(s).sort());
    };
    run();
  }, []);

  // Load students based on class & section
  const loadStudents = async () => {
    if (!grade || !section) return setInfo("Select a class and section.");
    setLoading(true);
    setInfo("");
    try {
      const qRef = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("class", "==", toStr(grade)),
        where("section", "==", toStr(section))
      );
      const snap = await getDocs(qRef);
      const list = snap.docs
        .map((d) => ({
          id: d.id,
          name: toStr(d.data().name || "Student"),
          rollNumber: toStr(d.data().rollNumber || ""),
        }))
        .sort((a, b) => (Number(a.rollNumber) || 0) - (Number(b.rollNumber) || 0));
      setStudents(list);

      const key = `att-draft:${grade}-${section}:${date}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setMarks(JSON.parse(saved));
      } else {
        setMarks({});
      }
    } finally {
      setLoading(false);
    }
  };

  // Default all attendance marks to Present if none exist
useEffect(() => {
  if (students.length === 0) return;
  const hasAnyStatus = Object.values(marks).some((m) => m.status);
  if (!hasAnyStatus) {
    const defaultMarks = {};
    students.forEach((s) => {
      if (s.rollNumber) defaultMarks[s.rollNumber] = { status: "Absent" }; // <-- default Absent here
    });
    setMarks(defaultMarks);
  }
}, [students]);


  // Save draft marks to localStorage
  useEffect(() => {
    if (!grade || !section || !date) return;
    const key = `att-draft:${grade}-${section}:${date}`;
    localStorage.setItem(key, JSON.stringify(marks));
  }, [marks, grade, section, date]);

  const setStatus = (rn, status) =>
    rn && setMarks((p) => ({ ...p, [rn]: { ...(p[rn] || {}), status } }));

  const setNote = (rn, note) =>
    rn && setMarks((p) => ({ ...p, [rn]: { ...(p[rn] || {}), note } }));

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => {
      if (s.rollNumber) next[s.rollNumber] = { ...(marks[s.rollNumber] || {}), status };
    });
    setMarks(next);
  };

  // Save attendance data to Firestore
  const saveAll = async () => {
    if (!grade || !section) return setInfo("Select a class and section.");
    const teacherName = profile?.name || auth.currentUser?.displayName || "teacher";
    const entries = students
      .filter((s) => s.rollNumber && marks[s.rollNumber]?.status)
      .map((s) => ({
        rollNumber: toStr(s.rollNumber),
        studentId: toStr(s.id),
        date,
        status: marks[s.rollNumber].status,
        class: toStr(grade),
        section: toStr(section),
        note: toStr(marks[s.rollNumber].note || ""),
        classId: `${toStr(grade)}-${toStr(section)}`,
        markedBy: user?.uid || "",
        markedByName: teacherName,
        createdAt: new Date(),
      }));

    if (entries.length === 0) return setInfo("Mark at least one student.");

    setSaving(true);
    try {
      await Promise.all(entries.map((e) => addDoc(collection(db, "attendance"), e)));
      const present = entries.filter((e) => e.status === "Present").length;
      const total = students.length;
      await setDoc(
        doc(db, "attendance", date, "classes", `${grade}-${section}`),
        { present, total, markedByUid: user?.uid || "", markedByName: teacherName, markedAt: new Date() },
        { merge: true }
      );
      await addDoc(collection(db, "activity"), {
        type: "marked",
        classId: `${grade}-${section}`,
        actorUid: user?.uid || "",
        actorName: teacherName,
        createdAt: new Date(),
      });
      setInfo(`Attendance ${entries.length} records; aggregate updated.`);
    } catch (e) {
      setInfo(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-teal-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-xl font-semibold text-slate-900">Mark Attendance</h1>
          <p className="text-[13px] text-slate-600">Select a class and date, then record statuses.</p>

          <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Class</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Section</option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadStudents}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                {loading ? "Loading…" : "Load Students"}
              </motion.button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAll("Present")}
                  className="rounded-md bg-green-600 text-white px-3 py-2 text-sm hover:bg-green-500 w-full"
                >
                  All Present
                </button>
                <button
                  onClick={() => markAll("Absent")}
                  className="rounded-md bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-500 w-full"
                >
                  All Absent
                </button>
              </div>
            </div>
            {info && <p className="mt-2 text-[13px] text-slate-600">{info}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur z-10">
            <h2 className="text-base font-semibold">Students</h2>
            <button
              onClick={saveAll}
              disabled={saving}
              className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-500 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          <div className="divide-y divide-slate-200 overflow-x-auto">
            {students.length === 0 && !loading && (
              <div className="px-4 py-10 text-sm text-slate-500">No students loaded.</div>
            )}
            {students.map((s) => {
              const rn = s.rollNumber;
              const sel = marks[rn]?.status || "";
              return (
                <div key={s.id} className="px-4 py-3 flex flex-wrap gap-3 items-center">
                  <div className="w-10 text-xs text-slate-500">{rn || "-"}</div>
                  <div className="flex-1 text-sm min-w-[120px]">{s.name}</div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setStatus(rn, "Present")}
                      className={
                        (sel === "Present"
                          ? "bg-green-600 text-white border-emerald-600"
                          : "bg-white text-emerald-700 border-emerald-600 hover:bg-emerald-50") +
                        " px-3 py-1 rounded-md border text-sm transition-colors"
                      }
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(rn, "Absent")}
                      className={
                        (sel === "Absent"
                          ? "bg-red-600 text-white border-rose-600"
                          : "bg-white text-red-700 border-rose-600 hover:bg-rose-50") +
                        " px-3 py-1 rounded-md border text-sm transition-colors"
                      }
                    >
                      Absent
                    </button>
                  </div>

                  <input
                    value={marks[rn]?.note || ""}
                    onChange={(e) => setNote(rn, e.target.value)}
                    placeholder="Reason (optional)"
                    className="ml-3 w-full sm:w-56 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
