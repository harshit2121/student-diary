import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AddStudent() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState({
    rollNumber: "",
    name: "",
    class: "",
    section: "",
    phone: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Access gate: teacher only (claims-first, fallback to users doc)
  useEffect(() => {
    let unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setAllowed(false);
        setChecking(false);
        navigate("/teacher-login");
        return;
      }
      try {
        // claims-first
        const token = await u.getIdTokenResult(true);
        if (token?.claims?.role === "teacher") {
          setAllowed(true);
          setChecking(false);
          return;
        }
        // fallback: users/{uid}.role == "teacher"
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data().role : null;
        setAllowed(role === "teacher");
      } catch {
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    });
    return () => unsub && unsub();
  }, [navigate]);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Light golden streaks
  const streaks = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 12 + Math.random() * 10,
        scale: 0.6 + Math.random() * 0.9,
        opacity: 0.12 + Math.random() * 0.2,
      })),
    []
  );

  const validate = () => {
    const rn = form.rollNumber.trim();
    const nm = form.name.trim();
    const cls = form.class.trim();
    const sec = form.section.trim();
    const ph = form.phone.trim();
    const pwd = form.password;

    if (!rn || !nm || !cls || !sec || !ph || !pwd) return "Please fill all fields.";
    if (!/^[A-Za-z0-9-_.]+$/.test(rn)) return "Roll number can include letters, numbers, - _ . only.";
    if (!/^[1-9][0-2]?$/.test(cls)) return "Class must be 1–12.";
    if (!/^[A-Z]$/.test(sec)) return "Section must be a single uppercase letter.";
    if (!/^\d{10}$/.test(ph)) return "Phone must be 10 digits.";
    if (pwd.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleAdd = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    try {
      // Single source of truth: users collection
      // If you later create an Auth user for the student, write under that uid; for now, use rollNumber as id.
      const id = form.rollNumber.trim();
      const payload = {
        uid: id,
        rollNumber: form.rollNumber.trim(),
        name: form.name.trim(),
        class: form.class.trim(),
        section: form.section.trim(),
        phone: form.phone.trim(),
        // For demo only; in production, create Auth user and DO NOT store raw passwords
        password: form.password,
        role: "student",
        createdAt: serverTimestamp(),
        classSection: `${form.class.trim()}-${form.section.trim()}`,
      };

      // Write to users (student signup store)
      await setDoc(doc(db, "users", id), payload);

      // Optional mirror to students for quick roster lookups (remove if not needed)
      await setDoc(doc(db, "students", id), payload);

      setSuccessMsg(`Student ${payload.name} added successfully.`);
      setForm({ rollNumber: "", name: "", class: "", section: "", phone: "", password: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to add student. Check permissions or try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center text-amber-900">
        Checking access…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen grid place-items-center text-amber-900">
        Access denied. Teacher account required.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-amber-900">
      {/* Golden base */}
      <motion.div
        aria-hidden
        className="absolute -inset-1"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(135deg, #fff3bf 0%, #ffd166 45%, #f59f00 100%)",
        }}
      />
      {/* Sun-ray conic glow */}
      <motion.div
        aria-hidden
        className="absolute -inset-1 pointer-events-none"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 200deg at 30% 30%, rgba(250,204,21,0.35), rgba(217,119,6,0.28), rgba(161,98,7,0.25), rgba(250,204,21,0.35))",
          filter: "blur(80px)",
        }}
      />
      {/* Light streaks */}
      <div className="pointer-events-none absolute inset-0">
        {streaks.map((s) => (
          <motion.div
            key={s.id}
            className="absolute top-[-10vh]"
            style={{ left: s.left }}
            initial={{ y: "-10vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "115vh",
              rotate: [0, 16, -8, 12, 0],
              opacity: [0, s.opacity, s.opacity, 0],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="h-3 w-14 rounded-full"
              style={{
                transform: `scale(${s.scale})`,
                background:
                  "linear-gradient(90deg, rgba(253,224,71,0.00) 0%, rgba(253,224,71,0.45) 30%, rgba(245,158,11,0.45) 60%, rgba(217,119,6,0.45) 100%)",
                filter: "blur(1.2px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Form card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-lg">
          {/* Gold rim glow */}
          <motion.div
            aria-hidden
            className="absolute -inset-[2px] rounded-3xl blur-[12px]"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(135deg, rgba(250,204,21,0.9), rgba(245,158,11,0.9), rgba(217,119,6,0.9))",
            }}
          />
          <form
            onSubmit={handleAdd}
            className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-amber-200 shadow-xl p-7 sm:p-8"
          >
            <div className="mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-md mb-3" />
              <h2 className="text-2xl font-bold text-amber-900">Add Student</h2>
              <p className="text-amber-800/90 text-sm mt-1">Teachers only • Writes to users (student signup store)</p>
            </div>

            {error && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm mb-3">
                {error}
              </p>
            )}
            {successMsg && (
              <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm mb-3">
                {successMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="rollNumber"
                placeholder="Roll Number"
                value={form.rollNumber}
                onChange={onChange}
                className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={onChange}
                className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <input
                name="class"
                placeholder="Class (1–12)"
                value={form.class}
                onChange={onChange}
                className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <input
                name="section"
                placeholder="Section (A)"
                value={form.section}
                onChange={onChange}
                className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <input
                name="phone"
                placeholder="Phone (10 digits)"
                value={form.phone}
                onChange={onChange}
                className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="Password (min 6)"
                  value={form.password}
                  onChange={onChange}
                  className="w-full border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/80 hover:text-amber-800"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-xl px-4 py-3 border border-amber-300 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-amber-900 font-semibold hover:from-amber-200 hover:to-amber-400 shadow disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add Student"}
            </motion.button>

            <p className="text-[12px] text-amber-800/80 mt-3">
              For production: create the student Auth account and do not store raw passwords.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
