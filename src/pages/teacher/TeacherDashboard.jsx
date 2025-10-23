import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useTeacherData } from "../../hooks/useTeacherData";
import {
  CalendarDays,
  ClipboardList,
  LogOut,
  Users,
  TrendingUp,
  Gauge,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Color palette: soft warm yellows and dark text
const COLORS = {
  bg: "#fffbea",
  headerBg: "#fff3c4",
  borderYellow: "#facc15",
  textPrimary: "#78350f",
  cardBg: "#fffbeb",
  cardBorder: "#fde68a",
  hoverBg: "#fef3c7",
};

export default function TeacherDashboard() {
  const [uid, setUid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
    return () => unsub();
  }, []);

  const { loading, teacher, kpis, classWise, activity } = useTeacherData(uid);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/teacher-login");
  };

  const cards = [
    { label: "Today's Attendance", value: `${kpis?.todayPct ?? 0}%`, sub: "Live today", icon: Gauge },
    { label: "Present Students", value: kpis?.presentCount ?? "0/0", sub: "Out of total students", icon: Users },
    { label: "Weekly Average", value: `${kpis?.weeklyAvg ?? 0}%`, sub: "Last 7 days", icon: TrendingUp },
    {
      label: "Classes Today",
      value: `${kpis?.classesToday ?? 0}`,
      sub: `Marked: ${kpis?.markedCount ?? 0}/${kpis?.classesToday ?? 0}`,
      icon: CalendarDays,
    },
  ];

  if (!uid) {
    return (
      <CenteredMessage
        text="Checking authentication…"
        bgColor={COLORS.bg}
        textColor={COLORS.textPrimary}
      />
    );
  }

  if (loading) {
    return (
      <CenteredMessage
        text="Loading dashboard..."
        bgColor={COLORS.bg}
        textColor={COLORS.textPrimary}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.textPrimary }}>
      {/* Header with CM Rise logo */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: COLORS.headerBg, borderColor: COLORS.borderYellow }}
      >
        <div className="flex items-center gap-4">
          <img src="/cmrise.png" alt="CM Rise Logo" className="h-14 object-contain" />
          <h1 className="font-extrabold text-2xl tracking-wider select-none">Student Diary Faculty Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block font-semibold">Hi, {teacher?.name ?? ""}</span>
          <LogoutButton onClick={handleLogout} bgColor={COLORS.headerBg} hoverColor={COLORS.hoverBg} />
        </div>
      </header>

      {/* KPI Cards */}
      <section className="max-w-7xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <motion.div
            key={label}
            className="rounded-lg border p-6 flex justify-between items-center shadow-lg cursor-default"
            style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.cardBorder }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ scale: 1.03 }}
          >
            <div>
              <p className="text-sm font-semibold opacity-80">{label}</p>
              <p className="font-extrabold text-3xl mt-1">{value}</p>
              <p className="text-xs text-yellow-700 mt-1">{sub}</p>
            </div>
            <Icon size={40} className="text-yellow-700 opacity-70" />
          </motion.div>
        ))}
      </section>

      {/* Main Section: Class-wise Attendance and Recent Activity */}
      <main className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 px-6 pb-10">
        {/* Class-wise Attendance */}
        <motion.section
          className="rounded-lg border p-6 shadow-xl"
          style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.cardBorder }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold tracking-wide">Class-wise Attendance</h2>
            <button
              onClick={() => navigate("/teacher/attendance-report")}
              className="text-yellow-600 font-semibold underline hover:text-yellow-800"
              aria-label="View detailed attendance report"
            >
              View Detailed Report
            </button>
          </div>
          {classWise.length > 0 ? (
            classWise.map(({ section, present, total, pct }) => (
              <div key={section} className="mb-4 flex items-center gap-4">
                <div className="min-w-[110px] font-semibold">{section}</div>
                <div className="flex-1 bg-yellow-300 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-yellow-600 h-full rounded-full transition-width duration-300 ease-in-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-yellow-800 font-semibold whitespace-nowrap w-16">{present}/{total}</div>
                <div className="text-yellow-900 font-semibold bg-yellow-200 rounded px-2 w-14 text-center">{pct}%</div>
              </div>
            ))
          ) : (
            <p className="text-yellow-700 font-semibold text-center">No classes assigned.</p>
          )}
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          className="rounded-lg border p-6 shadow-xl"
          style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.cardBorder }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h2 className="text-2xl font-extrabold mb-6 tracking-wide">Recent Activity</h2>
          <ul className="divide-y divide-yellow-300 max-h-[420px] overflow-auto">
            {activity.length > 0 ? (
              activity.map(({ status, cls, time }, i) => (
                <li key={i} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${status === "absent" ? "bg-red-600" : "bg-green-600"}`}
                    />
                    <div>
                      <p className="text-yellow-900 font-medium text-sm">
                        {status === "absent" ? "Student absent" : "Attendance marked"}
                      </p>
                      <p className="text-yellow-800 text-xs opacity-80">{cls}</p>
                    </div>
                  </div>
                  <span className="text-yellow-800 opacity-80 text-xs">{time}</span>
                </li>
              ))
            ) : (
              <p className="text-yellow-700 font-semibold text-center py-6">No recent activity.</p>
            )}
          </ul>
        </motion.section>
      </main>
    </div>
  );
}

function CenteredMessage({ text, bgColor, textColor }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center font-semibold text-lg"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {text}
    </div>
  );
}

function LogoutButton({ onClick, bgColor, hoverColor }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-3 py-1 font-semibold shadow transition"
      style={{ backgroundColor: bgColor, color: "#78350f" }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverColor}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = bgColor}
    >
      <LogOut className="inline-block mr-1" size={18} />
      Logout
    </button>
  );
}
