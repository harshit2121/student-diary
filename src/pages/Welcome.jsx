import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TypewriterHeading from "./TypewriterHeading";
// Replace these with your actual asset paths
// 1) Put your background image in /public/hero.jpg (or any name) and update bgUrl.
// 2) Put your logo in /src/assets/logo.png (or public/logo.png) and update logoUrl.

const bgUrl = "/SOEJhabu.png" // public/hero.jpg will be served at /hero.jpg
const logoUrl = "/cmrise.png"; // public/logo.png or an imported asset

export default function Welcome() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-[#0b0d14]">
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.72)",
        }}
      />
      {/* Readability overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,10,18,0.82) 0%, rgba(7,10,18,0.70) 40%, rgba(7,10,18,0.78) 100%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        {/* Top bar with logo space */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover bg-white/10 border border-white/15"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="min-w-0">
              <p className="text-white/70 text-[11px] sm:text-xs tracking-widest">
                CM RISE • JHABUA
              </p>
              {/* Typewriter heading */}
              <TypewriterHeading
                className="mt-1 text-[20px] sm:text-3xl md:text-4xl font-extrabold leading-[1.15]"
                typingSpeed={34}
                eraseSpeed={20}
                holdTime={1200}
                cursorColor="#df31bcff"
              />
            </div>
          </div>
          <div />
        </div>

        <p className="mt-3 sm:mt-5 text-white/85 text-sm sm:text-base max-w-3xl">
          Choose the correct portal to continue.
        </p>

        {/* Cards */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            to="/StudentLogin"
            title="Student Login"
            desc="Profile and updates."
            accent="amber"
            emoji="🎓"
          />
        </div>

        {/* Footer */}
        <div className="mt-10 sm:mt-12 flex items-center gap-2 text-white/75 text-xs sm:text-xl">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Secure • Mobile-first • Made in Bharat</span>
        </div>
      </div>
    </div>
  );
}

function PortalCard({ to, title, desc, accent, emoji }) {
  const accents = {
    indigo: {
      ring: "ring-indigo-300/30",
      pill: "bg-indigo-400 hover:bg-indigo-300",
      dot: "bg-indigo-400",
    },
    emerald: {
      ring: "ring-emerald-300/30",
      pill: "bg-emerald-400 hover:bg-emerald-300",
      dot: "bg-emerald-400",
    },
    amber: {
      ring: "ring-amber-300/30",
      pill: "bg-amber-400 hover:bg-amber-300",
      dot: "bg-amber-400",
    },
  }[accent];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`relative rounded-2xl border border-white/10 bg-white/[0.08] backdrop-blur-xl p-4 sm:p-5 ring-1 ${accents.ring}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 grid place-items-center text-lg">
          <span>{emoji}</span>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <span className={`h-2 w-2 rounded-full ${accents.dot}`} />
        </div>
      </div>
      <p className="text-white/80 text-sm mt-2">{desc}</p>

      <Link to={to} className="block mt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-full px-4 py-2.5 text-sm sm:text-base font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(0,0,0,0.35)] ${accents.pill}`}
          style={{ border: "1px solid rgba(255,255,255,0.55)" }}
        >
          Continue
        </motion.button>
      </Link>
    </motion.div>
  );
}