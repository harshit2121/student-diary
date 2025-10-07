import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { db } from "../../firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AdminTeacherApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const q = query(collection(db, "users"), where("role", "==", "teacher"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      setPending(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, next) => {
    try {
      await updateDoc(doc(db, "users", id), { status: next });
      setPending((list) => list.filter(x => x.id !== id));
    } catch (e) {
      alert(e.message || "Action failed");
    }
  };

  return (
    <AdminLayout
      title="Teacher Approvals"
      actions={
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={load} className="px-4 py-2 rounded-xl bg-white/15 border border-white/30">
          {loading ? "Refreshing…" : "Refresh"}
        </motion.button>
      }
    >
      {err && <p className="text-rose-300 text-sm mb-3">{err}</p>}
      {pending.length === 0 && <p className="text-white/80">No pending requests.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pending.map(t => (
          <div key={t.id} className="rounded-2xl bg-white/10 border border-white/20 p-4">
            <h3 className="font-semibold">{t.name || t.email}</h3>
            <p className="text-white/80 text-sm">Email: {t.email}</p>
            <p className="text-white/80 text-sm">Phone: {t.phone || "-"}</p>
            <div className="flex gap-3 mt-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => act(t.id, "approved")}
                className="px-4 py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white">
                Approve
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => act(t.id, "rejected")}
                className="px-4 py-2 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white">
                Reject
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
