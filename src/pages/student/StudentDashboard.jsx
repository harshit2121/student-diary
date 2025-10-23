import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  bg: "#ecf2fe",
  accent: "#2563eb",
  accentAlt: "#60a5fa",
  textDark: "#1e293b",
  card: "#fff",
  pills: "#e0e7ff",
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/StudentLogin");
      } else {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) setProfile(snap.data());
          else {
            await signOut(auth);
            navigate("/StudentLogin");
          }
        } catch {
          await signOut(auth);
          navigate("/StudentLogin");
        }
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, [navigate]);

  const fetchAttendance = async () => {
    if (!profile) return;
    setLoadingAtt(true);
    try {
      const attRef = collection(db, "attendance");
      const q = query(attRef, where("rollNumber", "==", String(profile.rollNumber)));
      const qs = await getDocs(q);
      let list = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      list = list.filter((r) => {
        const dt = new Date(r.date);
        return (!fromDate || dt >= new Date(fromDate)) && (!toDate || dt <= new Date(toDate));
      });
      list.sort((a, b) => (a.date < b.date ? 1 : -1));
      setAttendance(list);
    } finally {
      setLoadingAtt(false);
    }
  };

  useEffect(() => {
    if (profile) fetchAttendance();
    // eslint-disable-next-line
  }, [profile]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/StudentLogin");
  };

  const total = attendance.length || 0;
  const present = attendance.filter((a) => a.status === "Present").length;
  const percent = total ? Math.round((present / total) * 100) : 0;

  // Animated background bubbles
  const bubbles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        size: 12 + Math.random() * 18,
        x: `${Math.random() * 96 + 2}%`,
        delay: Math.random() * 3,
        duration: 6 + Math.random() * 3,
        opacity: 0.10 + Math.random() * 0.06,
      })),
    []
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-700">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
          Checking authentication…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: COLORS.bg }}>
      {/* Animated floating bubbles */}
      <div className="pointer-events-none absolute inset-0">
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            className="absolute rounded-full bg-blue-200 blur"
            style={{
              width: b.size,
              height: b.size,
              left: b.x,
              opacity: b.opacity,
              bottom: 0
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-10, -420], opacity: [0, b.opacity, 0] }}
            transition={{ delay: b.delay, duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* App Bar */}
      <motion.header
        className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between p-4 mt-3 bg-white/95 rounded-2xl shadow-lg"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4 w-full md:w-auto mb-3 md:mb-0">
          <img src="/cmrise.png" alt="Logo" className="h-10 w-10 rounded bg-blue-50 object-cover shadow" />
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-500 font-bold">
              School of Excellence • JHABUA
            </p>
            <h1 className="text-2xl font-bold text-blue-900 mt-0.5">Student Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <Pill label="Attendance" value={`${percent}%`} />
          <Pill label="Total Days" value={total} />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/notices/students")}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold shadow"
          >
            Notices
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-500 text-blue-900 font-semibold shadow"
          >
            Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 mt-3">
        {/* Profile and attendance summary */}
        <motion.section
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {profile &&
            <>
              <motion.img
                src={`https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(profile.name || "Student")}`}
                alt="profile"
                className="w-24 h-24 rounded-2xl border-4 border-blue-400 shadow"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              />
              <h2 className="text-2xl font-bold text-blue-800 mt-3">{profile.name}</h2>
              <p className="text-blue-500 mb-1 mt-0.5">
                Class: <span className="font-semibold">{profile.class}</span> •
                Section: <span className="font-semibold">{profile.section}</span>
              </p>
              <p className="text-blue-400 text-xs mb-2">
                Roll: {profile.rollNumber} • {profile.phone}
              </p>
              <motion.div className="my-6" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Donut percent={percent} />
              </motion.div>
              <div className="text-blue-700 text-xs font-semibold">Current Attendance Rate</div>
            </>
          }
          {!profile && <div className="text-blue-500">Loading profile…</div>}
        </motion.section>

        {/* Attendance history panel */}
        <motion.section
          className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-blue-800 text-lg font-bold">Attendance History</h3>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <span>Present</span>
              <div className="h-2 w-10 rounded-full bg-green-500" />
              <span>Absent</span>
              <div className="h-2 w-10 rounded-full bg-red-500" />
            </div>
          </div>
          {/* Date filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <InputDate value={fromDate} onChange={setFromDate} />
            <InputDate value={toDate} onChange={setToDate} />
            <motion.button
              onClick={fetchAttendance}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-4 py-2 shadow"
            >
              Filter by Date
            </motion.button>
          </div>
          {/* Badges */}
          <div className="flex gap-3 mb-4">
            <Badge tone="green" label="Present" value={present} />
            <Badge tone="red" label="Absent" value={total - present} />
            <Badge tone="indigo" label="Percent" value={`${percent}%`} />
          </div>
          {/* Attendance history list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <AnimatePresence initial={false}>
              {loadingAtt ? (
                <Fade>Loading attendance…</Fade>
              ) : attendance.length === 0 ? (
                <Fade>No records found</Fade>
              ) : (
                attendance.map((a, i) => (
                  <motion.div
                    key={a.id || i}
                    className="flex justify-between items-center p-3 rounded-lg border bg-blue-50 text-blue-900 font-medium shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                  >
                    <span>{a.date}</span>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        a.status === "Present" ? "bg-green-600 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {a.status} • {a.markedByName || a.markedBy || "Teacher"}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

/* ------------------- UI Components ------------------- */

function Pill({ label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-xl shadow text-blue-800 font-bold bg-blue-100 border border-blue-200">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Badge({ tone, label, value }) {
  const toneMap = {
    blue: "bg-blue-500",
    rose: "bg-rose-500",
    indigo: "bg-indigo-600",
    red: "bg-red-600",
    green: "bg-green-600",
  };
  return (
    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white font-semibold ${toneMap[tone]}`}>
      {label} <span>{value}</span>
    </span>
  );
}

function InputDate({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="p-2 bg-blue-50 border border-blue-300 rounded-lg text-blue-900 w-full"
    />
  );
}

function Fade({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-blue-500 py-3 text-center">
      {children}
    </motion.div>
  );
}

function Donut({ percent }) {
  return (
    <div className="relative" style={{ width: 130, height: 130 }}>
      <svg width={130} height={130} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" stroke="#e0e7ff" strokeWidth="11" fill="none" />
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          stroke="url(#grad)"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: percent / 100 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-blue-800 font-extrabold text-3xl select-none">
        {percent}%
      </div>
    </div>
  );
}
