import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadingAtt, setLoadingAtt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/student-login");
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [navigate]);

  const fetchAttendance = async () => {
    if (!profile) return;
    setLoadingAtt(true);
    try {
      const attRef = collection(db, "attendance");
      const q = query(attRef, where("rollNumber", "==", profile.rollNumber));
      const querySnap = await getDocs(q);
      const records = querySnap.docs.map((d) => d.data());
      const filtered = records.filter((r) => {
        const date = new Date(r.date);
        return (!fromDate || date >= new Date(fromDate)) && (!toDate || date <= new Date(toDate));
      });
      setAttendance(filtered);
    } finally {
      setLoadingAtt(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/StudentLogin");
  };

  // Peacock feather particles for a dark scene
  const feathers = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 14 + Math.random() * 10,
        scale: 0.7 + Math.random() * 0.9,
        opacity: 0.18 + Math.random() * 0.22,
      })),
    []
  );

  const total = attendance.length || 0;
  const present = attendance.filter((a) => a.status === "Present").length;
  const percent = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1220]">
      {/* Peacock-toned aurora for depth */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "inear-gradient(to right, #434343 0%, #000000 100%)",
          filter: "blur(20px)",
        }}
      />

      {/* Subtle dark vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "inear-gradient(to right, #434343 0%, #000000 100%)",
        }}
      />

      {/* Falling peacock feathers */}
      <div className="pointer-events-none absolute inset-0">
        {feathers.map((f) => (
          <motion.div
            key={f.id}
            className="absolute top-[-10vh]"
            style={{ left: f.left }}
            initial={{ y: "-10vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "115vh",
              rotate: [0, 18, -10, 14, 0],
              opacity: [0, f.opacity, f.opacity, 0],
            }}
            transition={{
              duration: f.duration,
              delay: f.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Feather streak (light-on-dark) */}
            <div
              className="h-4 w-16 rounded-full"
              style={{
                transform: `scale(${f.scale})`,
                background:
                  "linear-gradient(90deg, rgba(16,185,129,0.00) 0%, rgba(16,185,129,0.38) 30%, rgba(59,130,246,0.38) 60%, rgba(99,102,241,0.38) 100%)",
                filter: "blur(1.5px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="flex items-center justify-between rounded-2xl px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/15">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-300 via-teal-400 to-indigo-500 shadow-inner" />
              <span className="text-black font-semibold">Student Diary • Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/95 border border-slate-200 text-slate-900 shadow-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <span className="opacity-80">Attendance</span>
                <span className="font-semibold">{percent}%</span>
              </div>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/95 border border-slate-200 text-slate-900 shadow-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                <span className="opacity-80">Total Days</span>
                <span className="font-semibold">{attendance.length}</span>
              </div>
              {profile && (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Student")}`}
                  alt="avatar"
                  className="h-9 w-9 rounded-full border border-white/30"
                />
              )}
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg bg-white/15 hover:bg-white/25 text-black px-3 py-1.5 border border-white/20 transition text-black"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profile box: light surface, dark text */}
        <div className="lg:col-span-2">
          <div className="rounded-[20px] p-6 bg-black/95 text-black-900 border border-slate-200 shadow-xl bg-white"> {/* light box for readability */}
            {profile ? (
              <>
                <div className="text-center mb-5">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Student")}`}
                    alt="profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 border border-slate-200"
                  />
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                  <p className="text-slate-700 text-sm">
                    Class: {profile.class} • Section: {profile.section}
                  </p>
                  <p className="text-slate-700 text-xs">
                    Roll: {profile.rollNumber} • Phone: {profile.phone}
                  </p>
                </div>
                <div className="mt-2 text-center text-slate-500 italic">Principal’s Signature</div>
              </>
            ) : (
              <div className="text-slate-700">Loading profile…</div>
            )}
          </div>
        </div>

        {/* Attendance box: light surface, dark text */}
        <div className="lg:col-span-3">
          <div className="rounded-[20px] p-6 bg-white/95 text-black border border-slate-200 shadow-xl bg-white"> {/* light box for readability */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Attendance Records</h3>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span>Present</span>
                <div className="h-2 w-14 rounded-full bg-emerald-500/70" />
                <span>Absent</span>
                <div className="h-2 w-14 rounded-full bg-rose-500/70" />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-slate-300 bg-white text-slate-900 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder-slate-500 shadow-sm"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-slate-300 bg-white text-slate-900 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder-slate-500 shadow-sm"
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchAttendance}
                className="rounded-xl text-white px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 shadow-lg hover: bg-blue-600 text-white"
              >
                View Attendance
              </motion.button>
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white border border-slate-200 text-slate-900 shadow-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="opacity-80">Present</span>
                <span className="font-semibold">{present}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white border border-slate-200 text-slate-900 shadow-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="opacity-80">Absent</span>
                <span className="font-semibold">{total - present}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white border border-slate-200 text-slate-900 shadow-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span className="opacity-80">Percent</span>
                <span className="font-semibold">{percent}%</span>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {loadingAtt ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-slate-700"
                  >
                    Loading attendance…
                  </motion.div>
                ) : attendance.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-slate-700"
                  >
                    No records found
                  </motion.div>
                ) : (
                  attendance.map((a, idx) => (
                    <motion.div
                      key={`${a.date}-${idx}`}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm flex justify-between items-center"
                    >
                      <span>{a.date}</span>
                      <span
                        className={`px-2 py-1 rounded text-black text-sm ${
                          a.status === "Present" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      >
                        {a.status} {a.markedBy ? `• ${a.markedBy}` : ""}
                      </span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
