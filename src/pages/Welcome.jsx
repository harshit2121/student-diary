import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TypewriterHeading from "./TypewriterHeading";

const bgUrl = "/SOEJhabu.png";
const logoUrl = "/cmrise.png";

export default function Welcome() {
  return (
    <div className="relative min-h-screen text-white bg-[#0b0d14]">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.55)",
          transform: "translateZ(0)",
        }}
      />
      {/* Overlays */}
      <div aria-hidden className="absolute inset-0 bg-[#070a12]/65 backdrop-blur-[1px]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070a12]/20 to-[#070a12]" />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="CM RISE Jhabua logo"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover bg-white/10 ring-1 ring-white/15"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className="min-w-0">
              <p className="text-white/70 text-[11px] sm:text-xs tracking-widest">
                CM RISE • JHABUA
              </p>
              <TypewriterHeading
                className="mt-1 text-[20px] sm:text-3xl md:text-4xl font-extrabold leading-[1.15]"
                typingSpeed={28}
                eraseSpeed={0}
                holdTime={2200}
                cursorColor="#7c3aed"
              />
            </div>
          </div>
          <div />
        </header>

        {/* Shell card */}
        <section className="mt-6 sm:mt-8 grid lg:grid-cols-2 gap-6">
          {/* Left: brand & copy */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-white/[0.06] ring-1 ring-white/10 p-5 sm:p-7 backdrop-blur-xl"
          >
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Unified School Access
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-prose">
                Choose the appropriate portal to continue with administration, teaching, or student services in a secure, mobile‑first interface. 
              </p>
              <ul className="text-white/75 text-sm sm:text-base space-y-2">
                <li>• Role‑based access and streamlined approvals</li>
                <li>• Attendance, classes, and student profiles</li>
                <li>• Built for reliability and Bharat‑first UX</li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <Stat label="Uptime" value="99.9%" />
              <Stat label="Latency" value="<150ms" />
              <Stat label="Devices" value="Responsive" />
            </div>

            <div className="mt-6 h-px bg-white/10" />

            <div className="mt-4 flex items-center gap-2 text-white/75 text-xs sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Secure • Mobile‑first • Made in Bharat</span>
            </div>
          </motion.div>

          {/* Right: role cards */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
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
            {/* Optional fourth slot for future roles */}
            <PlaceholderCard />
          </motion.div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 p-3">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-0.5 text-base font-semibold">{value}</p>
    </div>
  );
}

function PortalCard({ to, title, desc, icon, tone = "primary" }) {
  const tones = {
    primary: {
      ring: "ring-violet-300/25",
      headerDot: "bg-violet-400",
      btn: "bg-violet-400 hover:bg-violet-300",
      border: "border-white/10",
      focus: "focus-visible:ring-violet-400/60",
    },
    success: {
      ring: "ring-emerald-300/25",
      headerDot: "bg-emerald-400",
      btn: "bg-emerald-400 hover:bg-emerald-300",
      border: "border-white/10",
      focus: "focus-visible:ring-emerald-400/60",
    },
    warning: {
      ring: "ring-amber-300/25",
      headerDot: "bg-amber-400",
      btn: "bg-amber-400 hover:bg-amber-300",
      border: "border-white/10",
      focus: "focus-visible:ring-amber-400/60",
    },
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={`relative rounded-2xl ${tones.border} bg-white/[0.07] backdrop-blur-xl p-4 sm:p-5 ring-1 ${tones.ring} h-full flex flex-col`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 grid place-items-center text-lg">
          <span aria-hidden>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <span className={`h-2 w-2 rounded-full ${tones.headerDot}`} />
        </div>
      </div>

      <p className="text-white/80 text-sm mt-2">{desc}</p>

      <Link to={to} className="block mt-auto">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-full px-4 py-2.5 text-sm sm:text-base font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(0,0,0,0.35)] ${tones.btn} ${tones.focus} focus-visible:outline-none focus-visible:ring-2`}
          style={{ border: "1px solid rgba(255,255,255,0.45)" }}
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
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-4 sm:p-5 grid place-items-center h-full">
      <div className="text-center text-white/60 text-sm">
        Future role slot
      </div>
    </div>
  );
}
