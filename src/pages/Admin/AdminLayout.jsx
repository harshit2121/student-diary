import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Bell, FilePlus, Users, ClipboardCheck, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ title, actions, children }) {
  const location = useLocation();

  const streaks = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 12 + Math.random() * 10,
        scale: 0.6 + Math.random() * 0.9,
        opacity: 0.14 + Math.random() * 0.22,
      })),
    []
  );

  const NavLink = ({ to, label, Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm ${
          isActive
            ? "bg-yellow-300 text-yellow-900 border border-yellow-400 shadow-[0_0_10px_rgba(253,224,71,0.6)]"
            : "bg-white/20 hover:bg-white/40 border border-yellow-200 text-yellow-50"
        }`}
      >
        <Icon size={16} className={isActive ? "text-yellow-800" : "text-yellow-200"} />
        <span className="drop-shadow-lg">{label}</span>
      </Link>
    );
  };

  return (
    <div className="relative min-h-screen text-yellow-100 overflow-hidden">
      {/* Subtle warm gradient background */}
      <motion.div
        aria-hidden
        className="absolute -inset-1"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "linear-gradient(135deg, #a16207 0%, #facc15 35%, #fef9c3 100%)",
        }}
      />

      {/* Moving soft aurora-like glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 220deg at 30% 30%, rgba(255,255,200,0.2), rgba(255,230,80,0.25), rgba(255,255,170,0.25))",
          filter: "blur(100px)",
        }}
      />

      {/* Floating golden streaks */}
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
              className="h-4 w-16 rounded-full bg-gradient-to-r from-yellow-200/0 via-yellow-400/60 to-yellow-200/0"
              style={{
                transform: `scale(${s.scale})`,
                filter: "blur(1.5px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Header section */}
      <header className="relative z-10 max-w-7xl mx-auto px-5 py-6 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="h-10 w-10 rounded-xl bg-yellow-300 shadow-lg flex items-center justify-center text-yellow-900 border border-yellow-400 animate-pulse">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide text-yellow-50 drop-shadow-[1px_2px_2px_rgba(0,0,0,0.3)]">
              {title}
            </h1>
            <p className="text-yellow-100 text-sm opacity-90">Admin • Educational Portal</p>
          </div>
        </motion.div>

        {/* Navbar links */}
        <motion.nav
          className="hidden md:flex items-center gap-3 text-sm font-semibold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
        >
          <NavLink to="/admin/dashboard" label="Dashboard" Icon={LayoutDashboard} />
          <NavLink to="/notices/admins" label="View Notices" Icon={Bell} />
          <NavLink to="/admin/post-notice" label="Add Notice" Icon={FilePlus} />
          <NavLink to="/admin/approvals" label="Approvals" Icon={ClipboardCheck} />
          <NavLink to="/admin/students" label="Students" Icon={Users} />
        </motion.nav>

        <div className="flex items-center gap-3">{actions}</div>
      </header>

      {/* Main content container */}
      <main className="relative z-10 max-w-7xl mx-auto px-5 pb-12">
        <motion.div
          className="rounded-3xl backdrop-blur-2xl border border-yellow-400/50 shadow-2xl p-8 bg-gradient-to-b from-yellow-50/20 via-yellow-100/5 to-yellow-50/0 relative overflow-hidden text-yellow-800"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Glowing top bar */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-3/4 bg-gradient-to-r from-yellow-200 via-yellow-400 to-transparent rounded-full opacity-90"
            animate={{ width: ["70%", "90%", "70%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />

          {/* Injected core page content */}
          <div className="relative z-10 text-yellow-900 font-medium">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}
