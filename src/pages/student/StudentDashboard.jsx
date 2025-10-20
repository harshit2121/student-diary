import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  page: "#0c1222",
  primary: "#2563eb",
  primaryAlt: "#1d4ed8",
  indigo: "#6366f1",
  textOnDark: "#e6eefc",
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadingAtt, setLoadingAtt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/student-login");
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    run();
  }, [navigate]);

  const fetchAttendance = async () => {
    if (!profile) return;
    setLoadingAtt(true);
    try {
      const attRef = collection(db, "attendance");
      const q = query(attRef, where("rollNumber", "==", String(profile.rollNumber)));
      const qs = await getDocs(q);
      const list = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = list.filter((r) => {
        const dt = new Date(r.date);
        return (!fromDate || dt >= new Date(fromDate)) && (!toDate || dt <= new Date(toDate));
      });
      // Sort newest first
      filtered.sort((a, b) => (a.date < b.date ? 1 : -1));
      setAttendance(filtered);
    } finally {
      setLoadingAtt(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/StudentLogin");
  };

  const total = attendance.length || 0;
  const present = attendance.filter((a) => a.status === "Present").length;
  const percent = total ? Math.round((present / total) * 100) : 0;

  // decorative dots
  const dots = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.floor(Math.random() * 2),
        opacity: 0.08 + Math.random() * 0.07,
      })),
    []
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.page }}>
      <div className="pointer-events-none absolute inset-0">
        {dots.map((d) => (
          <span
            key={d.id}
            className="absolute rounded-full bg-white"
            style={{ top: d.top, left: d.left, width: d.size, height: d.size, opacity: d.opacity }}
          />
        ))}
      </div>

      {/* App bar */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-5">
        <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-[#0f1830] border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-9 w-9 rounded-md bg-white/10 border border-white/20 object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div>
              <p className="text-[11px] tracking-widest" style={{ color: "rgba(230,238,252,0.7)" }}>
                School of Excellance • JHABUA
              </p>
              <h1 className="font-semibold" style={{ color: COLORS.textOnDark }}>
                Student Diary — Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pill label="Attendance" value={`${percent}%`} />
            <Pill label="Total Days" value={attendance.length} />
            <button
              onClick={handleLogout}
              className="ml-2 rounded-md px-3 py-1.5 border border-white/15"
              style={{ color: COLORS.textOnDark, backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profile card */}
        <Surface className="lg:col-span-2">
          {profile ? (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?background=1e293b&color=fff&name=${encodeURIComponent(
                    profile.name || "Student"
                  )}`}
                  alt="profile"
                  className="w-16 h-16 rounded-lg border border-slate-700"
                />
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900">{profile.name}</h2>
                  <p className="text-slate-600 text-sm">
                    Class: {profile.class} • Section: {profile.section}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Roll: {profile.rollNumber} • {profile.phone}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid place-items-center">
                <Donut percent={percent} />
                <p className="mt-2 text-slate-500 text-xs">Attendance this period</p>
              </div>
            </>
          ) : (
            <p className="text-slate-600">Loading profile…</p>
          )}
        </Surface>

        {/* Attendance */}
        <Surface className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-semibold">Attendance Records</h3>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Present</span>
              <div className="h-2 w-14 rounded-full bg-green-500" />
              <span>Absent</span>
              <div className="h-2 w-14 rounded-full bg-red-500" />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <InputDate value={fromDate} onChange={setFromDate} />
            <InputDate value={toDate} onChange={setToDate} />
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchAttendance}
              className="rounded-md text-white px-4 py-2 shadow-md"
              style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryAlt})` }}
            >
              View Attendance
            </motion.button>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-3 mb-5">
            <Badge tone="green" label="Present" value={present} />
            <Badge tone="red" label="Absent" value={total - present} />
            <Badge tone="indigo" label="Percent" value={`${percent}%`} />
          </div>

          {/* List */}
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {loadingAtt ? (
                <Fade>Loading attendance…</Fade>
              ) : attendance.length === 0 ? (
                <Fade>No records found</Fade>
              ) : (
                attendance.map((a, i) => {
                  const teacherRaw = a.markedByName || a.markedBy || "Teacher";
                  const teacherName =
                    teacherRaw && teacherRaw.length > 18 && !teacherRaw.includes(" ")
                      ? "Teacher"
                      : teacherRaw;
                  return (
                    <motion.div
                      key={`${a.id || a.date}-${i}`}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-3 rounded-md border bg-white text-slate-900 flex justify-between items-center"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <span>{a.date}</span>
                      <span
                        className={`px-2 py-1 rounded text-white text-xs ${
                          a.status === "Present" ? "bg-green-600" : "bg-rose-500"
                        }`}
                      >
                        {a.status} • {teacherName}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </Surface>
      </div>
    </div>
  );
}

/* ——— UI pieces ——— */

function Surface({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl p-6 border shadow-lg ${className}`}
      style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
    >
      {children}
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/10 border border-white/15">
      <span className="text-[12px]" style={{ color: COLORS.textOnDark }}>{label}</span>
      <span className="text-[12px] font-semibold" style={{ color: COLORS.textOnDark }}>{value}</span>
    </div>
  );
}

function Badge({ tone, label, value }) {
  const toneMap = {
    blue: "bg-blue-600",
    rose: "bg-rose-500",
    indigo: "bg-indigo-600",
    red: "bg-red-600",
    green: "bg-green-600",
  };
  return (
    <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-slate-100 text-slate-900 border" style={{ borderColor: "#e5e7eb" }}>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${toneMap[tone]}`} />
      <span className="opacity-80">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function InputDate({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-md p-2 bg-white text-slate-900 w-full"
      style={{ borderColor: "#e5e7eb" }}
    />
  );
}

function Fade({ children }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-600">{children}</motion.div>;
}

function Donut({ percent }) {
  return (
    <div className="relative">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="48" stroke="#e5e7eb" strokeWidth="10" fill="none" />
        <motion.circle
          cx="60" cy="60" r="48"
          stroke="url(#g)"
          strokeWidth="10" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: percent / 100 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor={COLORS.primary} />
            <stop offset="100%" stopColor={COLORS.indigo} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xl font-bold text-slate-800">
        {percent}%
      </div>
    </div>
  );
}
