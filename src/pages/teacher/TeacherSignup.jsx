import React, { useMemo, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function TeacherSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const disabled = useMemo(
    () => !form.name || !form.email || !form.password || !form.phone || saving,
    [form, saving]
  );

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      const payload = {
        uid: cred.user.uid,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: "teacher",
        status: "pending", // key change: requires admin approval
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), payload);

      // Do NOT navigate to dashboard. Show approval info instead.
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md w-full rounded-3xl p-7 sm:p-8 border border-amber-200 bg-white/90 text-amber-900 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Signup received</h1>
          <p className="text-amber-800/90">
            The account is created but requires admin approval before login. An approval notice will appear once allowed. Please check back later or contact admin.
          </p>
          <div className="mt-5 flex gap-3">
            <Link to="/teacher-login" className="underline">Go to Login</Link>
            <Link to="/" className="underline">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-amber-900">
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
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 200deg at 30% 30%, rgba(250,204,21,0.35), rgba(217,119,6,0.28), rgba(161,98,7,0.25), rgba(250,204,21,0.35))",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md">
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
          <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-amber-200 shadow-xl overflow-hidden p-7 sm:p-8">
            <div className="mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-md mb-3" />
              <h1 className="text-2xl font-bold text-amber-900">Teacher Signup</h1>
              <p className="text-amber-800/90 text-sm mt-1">Account will be activated after admin approval</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                  {error}
                </p>
              )}

              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={onChange("name")}
                className="w-full px-4 py-3 rounded-xl bg-white text-amber-900 placeholder-amber-500 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange("email")}
                className="w-full px-4 py-3 rounded-xl bg-white text-amber-900 placeholder-amber-500 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange("password")}
                  className="w-full px-4 py-3 rounded-xl bg-white text-amber-900 placeholder-amber-500 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/80 hover:text-amber-800"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone}
                onChange={onChange("phone")}
                className="w-full px-4 py-3 rounded-xl bg-white text-amber-900 placeholder-amber-500 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={disabled}
                className="w-full rounded-xl px-4 py-3 border border-amber-300 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-amber-900 font-semibold hover:from-amber-200 hover:to-amber-400 shadow disabled:opacity-60"
              >
                {saving ? "Creating…" : "Request Approval"}
              </motion.button>

              <p className="text-amber-900 text-sm text-center">
                Already have an account?{" "}
                <Link to="/teacher-login" className="underline font-semibold">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
