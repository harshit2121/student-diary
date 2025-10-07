import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Attendance() {
  const [role, setRole] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveInfo, setSaveInfo] = useState({ saving: false, msg: "" });
  const [debugInfo, setDebugInfo] = useState({ totalStudentsUsers: null });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setRole((u?.role || "").toString().trim().toLowerCase());
        setCurrentUser(u || {});
      } catch {
        setRole("");
      }
    }
  }, []);

  const trim = (v) => (v || "").toString().trim();
  const iso10 = (v) => (v || "").toString().slice(0, 10);
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  // Load students from users with existing fields (class, section, role)
  const fetchStudents = async () => {
    setLoadError("");
    setStudents([]);
    const cls = trim(selectedClass);
    const sec = trim(selectedSection);
    if (!cls || !sec) {
      setLoadError("Enter both Class and Section.");
      return;
    }
    setLoading(true);
    try {
      const totalSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      setDebugInfo({ totalStudentsUsers: totalSnap.size });

      const qRef = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("class", "==", cls),
        where("section", "==", sec)
      );
      const snap = await getDocs(qRef);
      // Expecting each student to have rollNumber; retain it for writes
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (list.length === 0) {
        setLoadError("No students matched the selected Class/Section.");
      }
      setStudents(list);
    } catch (e) {
      setLoadError(e?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  // Track selection keyed by rollNumber (instead of uid)
  const handleAttendanceChange = (rollNumber, status) => {
    if (!rollNumber) return;
    setAttendance((prev) => ({
      ...prev,
      [rollNumber]: { status, markedBy: currentUser?.name || "Teacher" },
    }));
  };

  // Confirm: write attendance docs with rollNumber, not studentId
  const confirmAttendance = async () => {
    setSaveInfo({ saving: true, msg: "" });
    const cls = trim(selectedClass);
    const sec = trim(selectedSection);
    const dateIso = iso10(selectedDate);

    if (!dateIso) {
      setSaveInfo({ saving: false, msg: "Please select a date." });
      alert("Please select a date.");
      return;
    }
    if (!cls || !sec) {
      setSaveInfo({ saving: false, msg: "Enter Class and Section before confirming." });
      alert("Enter Class and Section before confirming.");
      return;
    }

    // Build entries using only students which have valid rollNumber and a picked status
    const entries = Object.entries(attendance).filter(
      ([, att]) => att?.status === "Present" || att?.status === "Absent"
    );
    if (entries.length === 0) {
      setSaveInfo({ saving: false, msg: "Mark at least one student before confirming." });
      alert("Mark at least one student before confirming.");
      return;
    }

    try {
      const writes = entries.map(([rollNumber, att]) =>
        addDoc(collection(db, "attendance"), {
          rollNumber,          // key change
          date: dateIso,
          status: att.status,
          markedBy: att.markedBy || "Teacher",
          class: cls,
          section: sec,
          createdAt: new Date().toISOString(),
        })
      );
      const results = await Promise.allSettled(writes);
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.error("Some attendance writes failed:", failed.map((f) => f.reason));
        setSaveInfo({
          saving: false,
          msg: `Saved ${results.length - failed.length} of ${results.length}. Check console for errors.`,
        });
        alert(`Saved ${results.length - failed.length} of ${results.length}. Check console for errors.`);
        return;
      }
      setSaveInfo({ saving: false, msg: `Attendance confirmed for ${results.length} students.` });
      alert(`Attendance confirmed for ${results.length} students.`);
      setAttendance({});
    } catch (e) {
      console.error("Attendance save failed:", e);
      setSaveInfo({ saving: false, msg: e?.message || "Attendance save failed." });
      alert(e?.message || "Attendance save failed.");
    }
  };

  // Student: own attendance by rollNumber (use current user's rollNumber)
  const fetchStudentAttendance = async () => {
    if (!fromDate || !toDate || !currentUser?.rollNumber) return;
    const qRef = query(collection(db, "attendance"), where("rollNumber", "==", currentUser.rollNumber));
    const snap = await getDocs(qRef);
    const rows = snap.docs
      .map((d) => d.data())
      .filter((r) => {
        const d = iso10(r.date);
        return (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
      });
    setStudentAttendance(rows);
  };

  // Background feathers (unchanged)
  const feathers = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 12 + Math.random() * 10,
        scale: 0.7 + Math.random() * 0.9,
        opacity: 0.12 + Math.random() * 0.18,
      })),
    []
  );

  // TEACHER VIEW
if (isTeacher) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Golden base gradient */}
      <motion.div
        aria-hidden
        className="absolute -inset-1"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(135deg, #fff3bf 0%, #ffd166 45%, #f59f00 100%)",
        }}
      />
      {/* Sun‑ray conic glow */}
      <motion.div
        aria-hidden
        className="absolute -inset-1 pointer-events-none"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 200deg at 30% 30%, rgba(250,204,21,0.35), rgba(217,119,6,0.28), rgba(161,98,7,0.25), rgba(250,204,21,0.35))",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-amber-900">Teacher Attendance</h2>

        {/* Filters */}
        <div className="rounded-2xl p-5 bg-white border border-amber-200 shadow-lg mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Class (e.g., 10)"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-amber-200 bg-white text-amber-900 rounded-xl p-2 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <input
              type="text"
              placeholder="Section (e.g., A)"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border border-amber-200 bg-white text-amber-900 rounded-xl p-2 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-amber-200 bg-white text-amber-900 rounded-xl p-2 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchStudents}
              className="rounded-xl px-4 py-2 border border-amber-300 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 text-amber-900 hover:from-amber-100 hover:to-amber-300 shadow"
            >
              {loading ? "Loading..." : "Load Students"}
            </motion.button>
          </div>

          {/* Debug and errors */}
          <div className="mt-2 text-sm">
            {typeof debugInfo.totalStudentsUsers === "number" && (
              <p className="text-amber-800/80">Students in users: {debugInfo.totalStudentsUsers}</p>
            )}
            {loadError && <p className="text-red-600">{loadError}</p>}
            {saveInfo.msg && <p className="text-amber-800">{saveInfo.msg}</p>}
          </div>
        </div>

        {/* List */}
        <AnimatePresence>
          {students.length > 0 && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="rounded-2xl p-5 bg-white border border-amber-200 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-amber-900">Mark Attendance</h3>
              <div className="space-y-2">
                {students.map((stu) => {
                  const rn = trim(stu.rollNumber || "");
                  const sel = rn ? attendance[rn]?.status : undefined;
                  return (
                    <div
                      key={stu.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-white"
                    >
                      <span className="flex-1 text-amber-900">
                        {stu.name} {rn ? `(Roll ${rn})` : "(No Roll)"}
                      </span>

                      {/* Present */}
                      <button
                        onClick={() => rn && handleAttendanceChange(rn, "Present")}
                        disabled={!rn}
                        className={
                          sel === "Present"
                            ? "px-5 py-1 rounded bg-green-600 text-white border border-green-600"
                            : "px-5 py-1 rounded border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition disabled:opacity-50"
                        }
                      >
                        Present
                      </button>

                      {/* Absent */}
                      <button
                        onClick={() => rn && handleAttendanceChange(rn, "Absent")}
                        disabled={!rn}
                        className={
                          sel === "Absent"
                            ? "px-5 py-1 rounded bg-red-600 text-white border border-red-600"
                            : "px-5 py-1 rounded border border-red-600 text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 transition disabled:opacity-50"
                        }
                      >
                        Absent
                      </button>
                    </div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmAttendance}
                disabled={saveInfo.saving}
                className="mt-4 rounded-xl px-4 py-2 border border-amber-300 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 text-amber-900 hover:from-amber-100 hover:to-amber-300 shadow disabled:opacity-60"
              >
                {saveInfo.saving ? "Saving…" : "Confirm Attendance"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


  // STUDENT VIEW (reads by rollNumber now)
  if (isStudent) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">My Attendance</h2>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-slate-300 bg-white text-slate-900 rounded-xl p-2 focus:outline-none"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-slate-300 bg-white text-slate-900 rounded-xl p-2 focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchStudentAttendance}
            className="rounded-xl text-white px-4 py-2 bg-indigo-600 hover:bg-indigo-500"
          >
            View Attendance
          </motion.button>
        </div>

        {studentAttendance.length > 0 ? (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentAttendance.map((rec, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-3 py-2">{iso10(rec.date)}</td>
                    <td className={`px-3 py-2 ${rec.status === "Present" ? "text-emerald-600" : "text-rose-600"}`}>
                      {rec.status}
                    </td>01``
                    <td className="px-3 py-2">{rec.markedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-600">No attendance records found for selected dates.</p>
        )}
      </div>
    );
  }

  // ACCESS DENIED
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-6 text-center">
      <h3 className="text-xl font-semibold">Access denied</h3>
      <p className="text-slate-600">
        Please sign in as a teacher to use the attendance panel.{" "}
        <Link className="underline" to="/teacher-login">Go to Teacher Login</Link>
      </p>
    </div>
  );
}
