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
  // Filters and data
  const [classKeys, setClassKeys] = useState([]); // ["12-A", "10-B"]
  const [selected, setSelected] = useState("");
  const [qText, setQText] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  // Modals
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null); // {id,name,rollNumber,class,section}

  // Build class list from all students
  useEffect(() => {
    const run = async () => {
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

        // Recent percent from last 20 attendance docs
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
          (a, b) =>
            (Number(a.rollNumber) || 0) - (Number(b.rollNumber) || 0)
        );
        setRows(withPct);
      } catch (e) {
        setInfo(e?.message || "Failed to load students.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selected]);

  const filtered = useMemo(() => {
    const q = qText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        String(r.rollNumber).toLowerCase().includes(q)
    );
  }, [rows, qText]);

  // Save edit or create
  const saveEdit = async () => {
    if (!editing) return;
    const payload = {
      name: toStr(editing.name),
      rollNumber: toStr(editing.rollNumber),
      class: toStr(editing.class),
      section: toStr(editing.section),
      role: "student",
    };
    try {
      if (editing.id === "__new__") {
        await addDoc(collection(db, "users"), payload);
      } else {
        await updateDoc(doc(db, "users", editing.id), payload);
        setRows((rs) =>
          rs.map((r) =>
            r.id === editing.id
              ? { ...r, name: payload.name, rollNumber: payload.rollNumber }
              : r
          )
        );
      }
      setEditing(null);
      // Refresh class keys and list if the class/section changed
      if (selected !== `${payload.class}-${payload.section}`) {
        setSelected(`${payload.class}-${payload.section}`);
      } else {
        // reload current class silently
        setSelected((prev) => prev); // triggers effect only if you prefer manual reload
      }
    } catch (e) {
      setInfo(e?.message || "Save failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Student Roster</h1>
            <p className="text-[12px] text-slate-500 -mt-0.5">
              Manage student information
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500"
            onClick={() =>
              setEditing({
                id: "__new__",
                name: "",
                rollNumber: "",
                class: "",
                section: "",
              })
            }
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
            <div className="relative">
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
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
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

        {/* Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && (
            <div className="col-span-full text-sm text-slate-500">
              Loading students…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-sm text-slate-500">
              No students found.
            </div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 grid place-items-center text-sm font-medium">
                  {initials(s.name)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-slate-500">
                    Roll No: {s.rollNumber || "-"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 text-[12px] px-2 py-0.5">
                      {s.classId}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-blue-100 text-blue-700 text-[12px] px-2 py-0.5">
                      {s.percent}%
                    </span>
                  </div>
                </div>
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[12px] hover:bg-slate-50"
                  onClick={() =>
                    setEditing({
                      id: s.id,
                      name: s.name,
                      rollNumber: s.rollNumber,
                      class: s.classId.split("-")[0],
                      section: s.classId.split("-")[1],
                    })
                  }
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => setDetail(s)}
                >
                  View Details
                </button>
                <a
                  href={`/Attendance?class=${encodeURIComponent(
                    s.classId
                  )}&focus=${encodeURIComponent(s.rollNumber)}`}
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-center"
                >
                  Attendance
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details modal */}
      <Sheet
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Student Details"
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 grid place-items-center text-sm font-medium">
                {initials(detail.name)}
              </div>
              <div>
                <p className="font-medium">{detail.name}</p>
                <p className="text-slate-500 text-xs">
                  Roll No: {detail.rollNumber || "-"}
                </p>
                <p className="text-slate-500 text-xs">
                  Class: {detail.classId}
                </p>
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* Edit modal */}
      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === "__new__" ? "Add Student" : "Edit Student"}
      >
        {editing && (
          <div className="space-y-3">
            <LabeledInput
              label="Name"
              value={editing.name}
              onChange={(v) => setEditing({ ...editing, name: v })}
            />
            <LabeledInput
              label="Roll Number"
              value={editing.rollNumber}
              onChange={(v) => setEditing({ ...editing, rollNumber: v })}
            />
            <div className="grid grid-cols-2 gap-2">
              <LabeledInput
                label="Class"
                value={editing.class}
                onChange={(v) => setEditing({ ...editing, class: v })}
              />
              <LabeledInput
                label="Section"
                value={editing.section}
                onChange={(v) => setEditing({ ...editing, section: v })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function LabeledInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}

function Sheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-lg md:inset-y-0 md:my-auto md:h-fit md:rounded-2xl"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
