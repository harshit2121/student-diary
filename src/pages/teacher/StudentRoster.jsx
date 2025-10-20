import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Utils
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

  // Filters and data
  const [classKeys, setClassKeys] = useState([]); // ["12-A", "10-B"]
  const [selected, setSelected] = useState("");
  const [qText, setQText] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  // Editing moved to separate Add/Edit page, so no modal editing state here

  // Load classes
  useEffect(() => {
    const run = async () => {
      setInfo("");
      try {
        const s = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
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
    };
    run();
  }, []);

  // Load students for selected class
  useEffect(() => {
    const run = async () => {
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

        // Calculate attendance percent from last 20 attendance docs
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

        withPct.sort((a, b) => (Number(a.rollNumber) || 0) - (Number(b.rollNumber) || 0));
        setRows(withPct);
      } catch (e) {
        setInfo(e?.message || "Failed to load students.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selected]);

  // Filter rows by search query
  const filtered = useMemo(() => {
    const q = qText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || String(r.rollNumber).toLowerCase().includes(q)
    );
  }, [rows, qText]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header with Add Student redirect button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Student Roster</h1>
            <p className="text-[12px] text-slate-500 -mt-0.5">Manage student information</p>
          </div>
          <button
            onClick={() => navigate("/add-student")}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500 flex-shrink-0"
            aria-label="Add Student"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Search by name or roll number..."
                className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm w-full sm:w-48"
            >
              {classKeys.length === 0 && <option value="">No classes</option>}
              {classKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          {info && <p className="mt-2 text-[13px] text-slate-600">{info}</p>}
        </div>

        {/* Student Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && (
            <div className="col-span-full text-sm text-slate-500">Loading students…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-sm text-slate-500">No students found.</div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 grid place-items-center text-sm font-medium">
                  {initials(s.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    Roll No: {s.rollNumber || "-"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex rounded-md bg-slate-100 text-slate-700 px-2 py-0.5">
                      {s.classId}
                    </span>
                    <span className="inline-flex rounded-md bg-blue-100 text-blue-700 px-2 py-0.5">
                      {s.percent}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="mt-3 self-start inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[12px] hover:bg-slate-50"
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
                className="mt-2 self-start rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() =>
                  navigate(`/attendance?class=${encodeURIComponent(s.classId)}&focus=${encodeURIComponent(s.rollNumber)}`)
                }
              >
                Attendance
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
