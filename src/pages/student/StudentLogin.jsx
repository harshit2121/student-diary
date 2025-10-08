import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = { uid: cred.user.uid, email: cred.user.email, role: "student" };
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/student-dashboard", { state: { user } });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  // Build 12 animated light streaks
  const streaks = Array.from({ length: 12 }).map((_, i) => {
    const left = `${Math.random() * 100}%`;
    const delay = Math.random() * 6;
    const duration = 12 + Math.random() * 10;
    const scale = 0.6 + Math.random() * 0.9;
    const opacity = 0.14 + Math.random() * 0.22;
    return { id: i, left, delay, duration, scale, opacity };
  });

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Deep Navy gradient sky */}
      <motion.div
        aria-hidden
        className="absolute -inset-1"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "linear-gradient(135deg, #0b1220 0%, #0e1b33 40%, #0a1a3a 100%)",
        }}
      />
      {/* Indigo/blue conic aurora */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 220deg at 30% 30%, rgba(59,130,246,0.28), rgba(99,102,241,0.25), rgba(37,99,235,0.24), rgba(56,189,248,0.22), rgba(59,130,246,0.28))",
          filter: "blur(80px)",
        }}
      />

      {/* Floating light streaks */}
      <div className="pointer-events-none absolute inset-0">
        {streaks.map((s) => (
          <motion.div
            key={s.id}
            className="absolute top-[-10vh]"
            style={{ left: s.left }}
            initial={{ y: "-10vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "115vh",
              rotate: [0, 18, -10, 14, 0],
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
              className="h-4 w-16 rounded-full"
              style={{
                transform: `scale(${s.scale})`,
                background:
                  "linear-gradient(90deg, rgba(59,130,246,0.00) 0%, rgba(59,130,246,0.42) 30%, rgba(99,102,241,0.42) 60%, rgba(56,189,248,0.42) 100%)",
                filter: "blur(1.2px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Centered login card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md">
          {/* Rim glow */}
          <motion.div
            aria-hidden
            className="absolute -inset-[2px] rounded-3xl blur-[12px]"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))" }}
          />
          {/* Card */}
          <div className="relative rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl overflow-hidden">
            {/* Glossy sweep */}
            <motion.span
              aria-hidden
              className="absolute inset-0"
              initial={{ x: "-120%" }}
              animate={{ x: ["-120%", "120%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)",
                mixBlendMode: "overlay",
              }}
            />
            <div className="relative p-7 sm:p-8">
              <div className="mb-6">
                {/* LOGO SLOT (replaces colored square) */}
                <img
                  src="/cmrise.png"  // place your file at public/logo.png
                  alt="School Logo"
                  className="h-10 w-10 rounded-xl object-cover bg-white/10 border border-white/15 mb-3"
                  onError={(e) => {
                    // Hide gracefully if logo missing
                    e.currentTarget.style.display = "none";
                  }}
                />
                <h1 className="text-2xl font-bold">Student Login</h1>
                <p className="text-sm text-white/80 mt-1">Welcome back to Student Diary</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <p className="text-rose-300 text-sm bg-rose-950/40 border border-rose-400/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/90 text-black placeholder-slate-500 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/90 text-black placeholder-slate-500 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full rounded-xl px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold shadow-lg"
                >
                  Login
                </motion.button>
                <p className="text-white/90 text-sm text-center">
                  Don’t have an account?{" "}
                  <Link to="/student-signup" className="underline font-semibold">
                    Signup
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
