import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 20% 15%, rgba(90,130,255,0.12), transparent 60%), radial-gradient(900px 600px at 80% 20%, rgba(190,120,255,0.12), transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Hero */}
        <header className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg" />
          <div className="min-w-0">
            <p className="text-white/70 text-[11px] sm:text-xs tracking-widest truncate">
              CM RISE • JHABUA
            </p>
            <h1 className="mt-1 text-[22px] sm:text-3xl md:text-4xl font-extrabold leading-tight">
              CM RISE JHABUA — ERP
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-200">
                by Harshit Parmar
              </span>
            </h1>
          </div>
        </header>

        <p className="mt-3 sm:mt-4 text-white/80 text-sm sm:text-base max-w-2xl">
          Choose a portal to continue.
        </p>

        {/* Cards grid */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <PortalCard
            to="/admin-login"
            title="Admin Login"
            desc="Approvals, students, and settings."
            accent="indigo"
            emoji="🛡️"
          />
          <PortalCard
            to="/teacher-login"
            title="Teacher Login"
            desc="Attendance and class tools."
            accent="emerald"
            emoji="📘"
          />
          <PortalCard
            to="/student-login"
            title="Student Login"
            desc="Profile and updates."
            accent="amber"
            emoji="🎓"
          />
        </section>

        {/* Footer note */}
        <div className="mt-10 sm:mt-12 flex items-center gap-2 text-white/65 text-xs sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> 
          <span>Secure • Mobile-first • Built with care • Built In Bharat 🇮🇳</span>
        </div>
      </div>
    </div>
  );
}

function PortalCard({ to, title, desc, accent, emoji }) {
  const accents = {
    indigo: {
      ring: "ring-indigo-300/30",
      dot: "bg-indigo-400",
      pill: "from-indigo-400 to-sky-300",
      glow: "rgba(99,102,241,0.18)",
    },
    emerald: {
      ring: "ring-emerald-300/30",
      dot: "bg-emerald-400",
      pill: "from-emerald-400 to-teal-300",
      glow: "rgba(16,185,129,0.18)",
    },
    amber: {
      ring: "ring-amber-300/30",
      dot: "bg-amber-400",
      pill: "from-amber-400 to-orange-300",
      glow: "rgba(245,158,11,0.18)",
    },
  }[accent];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 ring-1 ${accents.ring}`}
    >
      {/* Subtle glow */}
      <div
        aria-hidden
        className="absolute -top-10 right-0 h-24 w-24 rounded-full blur-2xl opacity-40"
        style={{ background: accents.glow }}
      />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 grid place-items-center text-lg">
          <span>{emoji}</span>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <span className={`h-2 w-2 rounded-full ${accents.dot}`} />
        </div>
      </div>
      <p className="text-white/75 text-sm mt-2">{desc}</p>

      {/* Mobile-first full-width pill button */}
      <Link to={to} className="block mt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-full px-4 py-2.5 text-sm sm:text-base font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.35)] bg-gradient-to-r ${accents.pill}`}
          style={{
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 20px rgba(0,0,0,0.35)",
          }}
        >
          Continue
        </motion.button>
      </Link>
    </motion.div>
  );
}
