import React, { useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AdminAddStudent() {
  const [form, setForm] = useState({ rollNumber: "", name: "", class: "", section: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.rollNumber || !form.name || !form.class || !form.section || !form.phone || !form.password)
      return "Please fill all fields.";
    if (!/^[1-9][0-2]?$/.test(form.class)) return "Class must be 1–12.";
    if (!/^[A-Z]$/.test(form.section)) return "Section must be A–Z.";
    if (!/^\d{10}$/.test(form.phone)) return "Phone must be 10 digits.";
    if (form.password.length < 6) return "Password min 6 chars.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    const v = validate();
    if (v) { setErr(v); return; }
    setSaving(true);
    try {
      const id = form.rollNumber.trim();
      const payload = {
        uid: id,
        rollNumber: id,
        name: form.name.trim(),
        class: form.class.trim(),
        section: form.section.trim(),
        phone: form.phone.trim(),
        password: form.password, // note: for demo; in production create Auth user instead
        role: "student",
        status: "approved",
        classSection: `${form.class.trim()}-${form.section.trim()}`,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", id), payload);
      await setDoc(doc(db, "students", id), payload);
      setMsg(`Student ${payload.name} added.`);
      setForm({ rollNumber: "", name: "", class: "", section: "", phone: "", password: "" });
    } catch (e2) {
      setErr(e2.message || "Failed to add student.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <AdminLayout title="Add Student">
      {err && <p className="text-rose-300 text-sm mb-3">{err}</p>}
      {msg && <p className="text-emerald-300 text-sm mb-3">{msg}</p>}
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="rollNumber" placeholder="Roll Number" value={form.rollNumber} onChange={onChange}
               className="px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200" />
        <input name="name" placeholder="Full Name" value={form.name} onChange={onChange}
               className="px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200" />
        <input name="class" placeholder="Class (1–12)" value={form.class} onChange={onChange}
               className="px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200" />
        <input name="section" placeholder="Section (A)" value={form.section} onChange={onChange}
               className="px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200" />
        <input name="phone" placeholder="Phone (10 digits)" value={form.phone} onChange={onChange}
               className="px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200" />
        <input name="password" placeholder="Password (min 6)" value={form.password} onChange={onChange}
               type="password" className="px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200" />
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={saving} type="submit"
          className="sm:col-span-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
          {saving ? "Saving…" : "Add Student"}
        </motion.button>
      </form>
    </AdminLayout>
  );
}
