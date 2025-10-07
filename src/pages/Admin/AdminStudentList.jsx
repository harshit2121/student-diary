import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function AdminStudentList() {
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setErr(""); setLoading(true);
    try {
      let base = collection(db, "users");
      const filters = [where("role", "==", "student")];
      if (cls) filters.push(where("class", "==", cls));
      if (sec) filters.push(where("section", "==", sec));
      const q = query(base, ...filters);
      const snap = await getDocs(q);
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setErr(e.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, []);

  return (
    <AdminLayout
      title="Students"
      actions={
        <>
          <input value={cls} onChange={(e)=>setCls(e.target.value)} placeholder="Class"
                 className="px-3 py-2 rounded-lg bg-white/85 text-slate-900 mr-2" />
          <input value={sec} onChange={(e)=>setSec(e.target.value)} placeholder="Section"
                 className="px-3 py-2 rounded-lg bg-white/85 text-slate-900 mr-2" />
          <button onClick={load} className="px-4 py-2 rounded-xl bg-white/15 border border-white/30">
            {loading ? "Loading…" : "Load"}
          </button>
        </>
      }
    >
      {err && <p className="text-rose-300 text-sm mb-3">{err}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="text-white/80">
            <tr>
              <th className="py-2 pr-4">Roll</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Class</th>
              <th className="py-2 pr-4">Section</th>
              <th className="py-2 pr-4">Phone</th>
            </tr>
          </thead>
          <tbody className="text-white/95">
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="py-2 pr-4">{r.rollNumber || r.id}</td>
                <td className="py-2 pr-4">{r.name}</td>
                <td className="py-2 pr-4">{r.class}</td>
                <td className="py-2 pr-4">{r.section}</td>
                <td className="py-2 pr-4">{r.phone}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan="5" className="py-4 text-white/70">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
