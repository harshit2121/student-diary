import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { motion } from "framer-motion";

export default function AddStudent() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    rollNumber: "",
    name: "",
    class: "",
    section: "",
    email: "",
    phone: "",
    password: "",
  });

  // Access control: only allow teacher role
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setAllowed(false);
        setChecking(false);
        navigate("/teacher-login");
        return;
      }
      try {
        const token = await user.getIdTokenResult(true);
        if (token?.claims?.role === "teacher") {
          setAllowed(true);
          setChecking(false);
          return;
        }
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? snap.data().role : null;
        setAllowed(role === "teacher");
      } catch {
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (
      !form.rollNumber.trim() ||
      !form.name.trim() ||
      !form.class.trim() ||
      !form.section.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password
    )
      return "Please fill all fields.";
    if (!/^[A-Za-z0-9-_.]+$/.test(form.rollNumber))
      return "Roll number can include letters, numbers, - _ . only.";
    if (!/^[1-9][0-2]?$/.test(form.class)) return "Class must be 1–12.";
    if (!/^[A-Z]$/.test(form.section)) return "Section must be a single uppercase letter.";
    if (!/^\d{10}$/.test(form.phone)) return "Phone must be 10 digits.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const errorMsg = validate();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setSaving(true);

    try {
      // 1. Create Firebase Auth user for the student
      const userCredential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      const uid = userCredential.user.uid;

      // 2. Create Firestore user document with student info
      const payload = {
        uid,
        rollNumber: form.rollNumber.trim(),
        name: form.name.trim(),
        class: form.class.trim(),
        section: form.section.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: "student",
        createdAt: serverTimestamp(),
        classSection: `${form.class.trim()}-${form.section.trim()}`,
      };

      await setDoc(doc(db, "users", uid), payload);
      await setDoc(doc(db, "students", uid), payload);

      setSuccessMsg(`Student ${payload.name} added successfully.`);
      setForm({
        rollNumber: "",
        name: "",
        class: "",
        section: "",
        email: "",
        phone: "",
        password: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to add student. " + (err.message || ""));
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (checking)
    return <div className="min-h-screen grid place-items-center text-amber-900">Checking access…</div>;
  if (!allowed)
    return <div className="min-h-screen grid place-items-center text-amber-900">Access denied. Teacher account required.</div>;

  return (
    <div className="relative min-h-screen overflow-hidden text-amber-900">
      {/* Background and other UI omitted for brevity */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-lg">
          <form
            onSubmit={handleAdd}
            className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-amber-200 shadow-xl p-7 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-yellow-900 mb-6">Add Student</h2>
            {error && <p className="text-red-700 bg-red-50 border rounded-lg px-3 py-2 text-sm mb-3">{error}</p>}
            {successMsg && <p className="text-emerald-700 bg-emerald-50 border rounded-lg px-3 py-2 text-sm mb-3">{successMsg}</p>}

            <input
              name="rollNumber"
              placeholder="Roll Number"
              value={form.rollNumber}
              onChange={onChange}
              className="border border-amber-200 rounded-xl p-3 mb-3 w-full"
              required
            />
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={onChange}
              className="border border-amber-200 rounded-xl p-3 mb-3 w-full"
              required
            />
            <input
              name="class"
              placeholder="Class (1–12)"
              value={form.class}
              onChange={onChange}
              className="border border-amber-200 rounded-xl p-3 mb-3 w-full"
              required
            />
            <input
              name="section"
              placeholder="Section (A)"
              value={form.section}
              onChange={onChange}
              className="border border-amber-200 rounded-xl p-3 mb-3 w-full"
              required
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="border border-amber-200 rounded-xl p-3 mb-3 w-full"
              required
            />
            <input
              name="phone"
              placeholder="Phone (10 digits)"
              value={form.phone}
              onChange={onChange}
              className="border border-amber-200 rounded-xl p-3 mb-3 w-full"
              required
            />
            <div className="relative mb-3">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="Password (min 6)"
                value={form.password}
                onChange={onChange}
                className="border border-amber-200 rounded-xl p-3 w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="w-full rounded-xl py-3 bg-yellow-400 text-amber-900 font-semibold shadow disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add Student"}
            </motion.button>
            <p className="text-xs mt-2 text-amber-800/80">
              Passwords are securely handled by Firebase Authentication.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
