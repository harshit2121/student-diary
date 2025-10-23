import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TypewriterHeading from "./TypewriterHeading";

const bgUrl = "/SOEJhabu.png";
const logoUrl = "/cmrise.png";

export default function Welcome() {
  const floatingDots = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        size: 2 + Math.random() * 4,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: 0.05 + Math.random() * 0.1,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="relative min-h-screen text-yellow-900 bg-gradient-to-b from-yellow-100 via-yellow-50 to-yellow-100 overflow-hidden">
      {/* Background and Overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7) blur(4px)",
          transform: "translateZ(0)",
          zIndex: 0,
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(90deg, rgba(250,204,21,0.4), rgba(251,191,36,0.35), rgba(250,204,21,0.4))",
          filter: "blur(120px)",
          zIndex: 1,
        }}
      />
      <div className="absolute inset-0 pointer-events-none z-10">
        {floatingDots.map((d) => (
          <motion.span
            key={d.id}
            className="absolute rounded-full bg-yellow-300"
            style={{
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              opacity: d.opacity,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-10, -60], opacity: [0, d.opacity, 0] }}
            transition={{
              delay: d.delay,
              duration: d.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <main className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 py-12 flex flex-col md:flex-row items-center gap-12 min-h-screen">
        {/* Left Branding & Info */}
        <motion.section
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex-1 rounded-3xl p-8 bg-yellow-50 bg-opacity-70 backdrop-blur-sm shadow-2xl"
        >
          <img
            src={logoUrl}
            alt="CM RISE Jhabua logo"
            className="w-28 h-28 mb-8 rounded-xl border border-yellow-300 shadow-inner object-cover"
          />
          <h1 className="font-extrabold text-5xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500">
            <TypewriterHeading
              typingSpeed={32}
              eraseSpeed={0}
              holdTime={2200}
              cursorColor="#b45309"
            />
          </h1>
          <p className="mt-6 max-w-prose text-yellow-900 text-lg leading-relaxed">
            Choose the appropriate portal to continue with administration, teaching,
            or student services in a secure, mobile-first interface.
          </p>
          <ul className="mt-10 list-disc list-inside space-y-2 text-yellow-800 text-lg max-w-md font-semibold">
            <li>Role-based access and streamlined approvals</li>
            <li>Attendance, classes, and student profiles</li>
            <li>Built for reliability and Bharat-first UX</li>
          </ul>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center text-yellow-700/75 font-bold text-xl">
            <Stat label="Uptime" value="99.9%" />
            <Stat label="Latency" value="&lt;150ms" />
            <Stat label="Devices" value="Responsive" />
          </div>
          <p className="mt-14 text-yellow-700/90 text-sm font-semibold tracking-wide flex items-center gap-2 select-none">
            <span className="block w-3 h-3 rounded-full bg-emerald-400" />
            Secure • Mobile-first • Made in Bharat
          </p>
        </motion.section>

        {/* Right portal cards */}
        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-6"
          role="navigation"
          aria-label="Portal selection"
        >
          <PortalCard
            to="/admin-login"
            title="Admin Login"
            desc="Approvals, students, and settings."
            icon="🛡️"
            tone="primary"
          />
          <PortalCard
            to="/teacher-login"
            title="Faculty Login"
            desc="Attendance and class tools."
            icon="📘"
            tone="success"
          />
          <PortalCard
            to="/StudentLogin"
            title="Student Login"
            desc="Profile and updates."
            icon="🎓"
            tone="warning"
          />
          {/* New Principal Desk slot */}
          <PortalCard
            to="/principal-login"
            title="Principal Desk"
            desc="Notices, attendance records, and dashboard."
            icon="🎯"
            tone="rose"
          />
        </motion.section>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-yellow-200 p-4 shadow-inner border border-yellow-400">
      <p className="text-xs text-yellow-800 opacity-90">{label}</p>
      <p className="mt-1 text-yellow-900 font-bold">{value}</p>
    </div>
  );
}

function PortalCard({ to, title, desc, icon, tone = "primary" }) {
  const tones = {
    primary: {
      ring: "ring-yellow-400/40",
      headerDot: "bg-yellow-400",
      btn: "bg-yellow-400 hover:bg-yellow-300",
      border: "border-yellow-300",
      focus: "focus-visible:ring-yellow-400/60",
    },
    success: {
      ring: "ring-lime-400/40",
      headerDot: "bg-lime-400",
      btn: "bg-lime-400 hover:bg-lime-300",
      border: "border-lime-300",
      focus: "focus-visible:ring-lime-400/60",
    },
    warning: {
      ring: "ring-amber-300/40",
      headerDot: "bg-amber-400",
      btn: "bg-amber-400 hover:bg-amber-300",
      border: "border-amber-300",
      focus: "focus-visible:ring-amber-400/60",
    },
    rose: {
      ring: "ring-pink-400/40",
      headerDot: "bg-pink-400",
      btn: "bg-pink-400 hover:bg-pink-300",
      border: "border-pink-300",
      focus: "focus-visible:ring-pink-400/60",
    },
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(251, 164, 175, 0.6)" }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`relative rounded-3xl p-6 bg-white/20 backdrop-blur-xl border ${tones.border} ring-1 ${tones.ring} flex flex-col`}
      tabIndex={0}
    >
      <div className="flex items-center gap-5 mb-4">
        <div
          className={`h-14 w-14 rounded-xl grid place-items-center bg-white/30 border ${tones.border} text-4xl`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-yellow-50 font-extrabold text-2xl">{title}</h3>
          <span className={`h-4 w-4 rounded-full ${tones.headerDot}`} />
        </div>
      </div>

      <p className="text-yellow-300 text-lg">{desc}</p>

      <Link to={to} className="mt-auto block">
        <motion.button
          whileTap={{ scale: 0.96 }}
          className={`w-full rounded-full py-3 mt-8 text-yellow-900 font-extrabold shadow-lg ${tones.btn} ${tones.focus} focus-visible:outline-none focus-visible:ring-2`}
          aria-label={`Continue to ${title}`}
        >
          Continue
        </motion.button>
      </Link>
    </motion.div>
  );
}

function PlaceholderCard() {
  return (
    <div className="rounded-3xl bg-yellow-50 bg-opacity-20 border-2 border-dashed border-yellow-400 p-6 grid place-items-center">
      <p className="text-yellow-400 font-semibold text-center select-none">Future role slot</p>
    </div>
  );
}
