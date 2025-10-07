import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({ title, actions, children }) {
  const streaks = useMemo(
    () => Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 6,
      duration: 12 + Math.random() * 10,
      scale: 0.6 + Math.random() * 0.9,
      opacity: 0.14 + Math.random() * 0.22,
    })),
    []
  );

  const location = useLocation();
  const NavLink = ({ to, label }) => (
    <Link
      to={to}
      className={
        "px-3 py-2 rounded-lg border " +
        (location.pathname === to
          ? "bg-white/25 border-white/40"
          : "bg-white/12 hover:bg-white/20 border-white/25")
      }
    >
      {label}
    </Link>
  );

  return (
    <div className="relative min-h-screen text-white">
      {/* Deep Navy gradient sky */}
      <motion.div
        aria-hidden
        className="absolute -inset-1"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(135deg, #0b1220 0%, #0e1b33 40%, #0a1a3a 100%)",
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

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md" />
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-white/80 text-sm">Admin • Student Diary</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/admin/dashboard" label="Dashboard" />
          <NavLink to="/admin/approvals" label="Approvals" />
          <NavLink to="/admin/add-student" label="Add Student" />
          <NavLink to="/admin/students" label="Students" />
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>

      {/* Content card */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 pb-12">
        <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
