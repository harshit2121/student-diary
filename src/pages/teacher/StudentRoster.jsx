import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Search, Plus, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  bg: "#fff9db",
  cardBg: "#fffbea",
  border: "#facc15",
  textPrimary: "#663e00",
  textSecondary: "#a57d14",
  buttonBg: "#fbbf24",
  buttonHover: "#f59e0b",
};

const initials = (n = "") =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

const toStr = (v) => String(v ?? "").trim();

export default function StudentRoster() {
  const navigate = useNavigate();

  const [classKeys, setClassKeys] = useState([]); // ["12-A", "10-B"]
  const [selected, setSelected] = useState("");
  const [qText, setQText] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  useEffect(() => {
    (async () => {
      setInfo("");
      try {
        const s = await getDocs(
          query(collection(db, "users"), where("role", "==", "student"))
        );
        const set = new Set();
        s.forEach((d) => {
          const v = d.data();
          const g = toStr(v.class);
          const sec = toStr(v.section);
          if (g && sec) set.add(`${g}-${sec}`);
        });
        const list = Array.from(set).sort();
        setClassKeys(list);
        if (list[0]) setSelected(list[0]);
      } catch (e) {
        setInfo(e?.message || "Failed to load classes.");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selected) return;
      setLoading(true);
      setInfo("");
      try {
        const [gRaw, sRaw] = selected.split("-");
        const g = toStr(gRaw);
        const sec = toStr(sRaw);

        const qRef = query(
          collection(db, "users"),
          where("role", "==", "student"),
          where("class", "==", g),
          where("section", "==", sec)
        );

        const snap = await getDocs(qRef);

        const base = snap.docs.map((d) => ({
          id: d.id,
          name: toStr(d.data().name || "Student"),
          rollNumber: toStr(d.data().rollNumber || ""),
          classId: `${g}-${sec}`,
        }));

        const withPct = await Promise.all(
          base.map(async (st) => {
            let total = 0,
              present = 0;
            if (st.rollNumber) {
              const a = await getDocs(
                query(
                  collection(db, "attendance"),
                  where("rollNumber", "==", st.rollNumber),
                  orderBy("date", "desc"),
                  limit(20)
                )
              );
              a.forEach((r) => {
                total++;
                if (r.data().status === "Present") present++;
              });
            }
            return {
              ...st,
              percent: total ? Math.round((present / total) * 100) : 0,
            };
          })
        );

        withPct.sort(
          (a, b) => (Number(a.rollNumber) || 0) - (Number(b.rollNumber) || 0)
        );
        setRows(withPct);
      } catch (e) {
        setInfo(e?.message || "Failed to load students.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  const filtered = useMemo(() => {
    const q = qText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || String(r.rollNumber).toLowerCase().includes(q)
    );
  }, [rows, qText]);

  return (
    <div style={{ backgroundColor: COLORS.bg }} className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: COLORS.textPrimary }}>
            Student Roster
          </h1>
          <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
            Manage student information
          </p>
        </div>
        <button
          onClick={() => navigate("/add-student")}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-md shadow font-semibold"
          style={{ backgroundColor: COLORS.buttonBg, color: COLORS.textPrimary }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.buttonHover}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = COLORS.buttonBg}
          aria-label="Add Student"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {/* Search and filter */}
      <motion.div
        className="max-w-6xl mx-auto bg-white rounded-xl p-5 shadow-sm border border-yellow-300 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400" />
            <input
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Search by name or roll number..."
              className="w-full pl-11 pr-3 py-2 rounded-md border border-yellow-300 focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-300"
              style={{ color: COLORS.textPrimary, backgroundColor: COLORS.cardBg }}
            />
          </div>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="sm:w-48 py-2 px-3 rounded-md border border-yellow-300"
            style={{ color: COLORS.textPrimary, backgroundColor: COLORS.cardBg }}
          >
            {classKeys.length === 0 && <option value="">No classes</option>}
            {classKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        {info && <p className="mt-3 text-sm" style={{ color: COLORS.textSecondary }}>{info}</p>}
      </motion.div>

      {/* Students cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && (
          <p className="col-span-full text-center text-yellow-700">Loading students…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full text-center text-yellow-700">No students found.</p>
        )}
        {filtered.map((s) => (
          <motion.div
            key={s.id}
            className="rounded-xl bg-white border border-yellow-300 p-5 shadow-md flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="h-11 w-11 rounded-full bg-yellow-100 text-yellow-700 font-semibold grid place-items-center text-xl"
              >
                {initials(s.name)}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate" style={{ color: COLORS.textPrimary }}>
                  {s.name}
                </p>
                <p className="text-xs text-yellow-500 truncate">
                  Roll No: {s.rollNumber || "-"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-yellow-700 text-xs">
                    {s.classId}
                  </span>
                  <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-yellow-600 text-xs font-semibold">
                    {s.percent}%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-auto flex gap-3 flex-wrap">
              <button
                className="inline-flex items-center gap-1 rounded-md border border-yellow-300 px-3 py-1 text-xs hover:bg-yellow-50 shadow-sm"
                onClick={() =>
                  navigate(`/edit-student/${s.id}`, {
                    state: {
                      name: s.name,
                      rollNumber: s.rollNumber,
                      class: s.classId.split("-")[0],
                      section: s.classId.split("-")[1],
                    },
                  })
                }
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                className="inline-flex items-center rounded-md border border-yellow-300 px-3 py-1 text-xs hover:bg-yellow-50 shadow-sm"
                onClick={() =>
                  navigate(`/attendance?class=${encodeURIComponent(s.classId)}&focus=${encodeURIComponent(s.rollNumber)}`)
                }
              >
                Attendance
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
