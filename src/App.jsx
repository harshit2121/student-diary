import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// Auth pages
import StudentLogin from "./pages/student/StudentLogin";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import StudentSignup from "./pages/student/StudentSignup";
import TeacherSignup from "./pages/teacher/TeacherSignup";
import Principallogin from "./pages/principal/PrincipalLogin.jsx";

// Dashboards and pages
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage";
import Attendance from "./pages/Attendance";
import AddStudent from "./pages/teacher/AddStudent";
import Teacherprofile from "./pages/teacher/Teacherprofile";
import Welcome from "./pages/Welcome";
import Roster from "./pages/teacher/StudentRoster";
import CalendarAttendance from "./pages/teacher/CalendarAttendance.jsx";
import AttendanceReport from "./pages/teacher/AttendanceReport.jsx";
import PrincipalDesk from "./pages/principal/PrincipalDesk.jsx";
// Notices imports
import StudentNoticeChannel from "./pages/notices/StudentNoticeChannel";
import TeacherNoticeChannel from "./pages/notices/TeacherNoticeChannel";
import AdminNoticeChannel from "./pages/notices/AdminNoticeChannel";
import AdminNoticePost from "./pages/notices/AdminNoticePost";

// Admin
import AdminRoute from "./pages/Admin/AdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminTeacherApprovals from "./pages/Admin/AdminTeacherApprovals";
import AdminStudentList from "./pages/Admin/AdminStudentList";

// Teacher guard
function TeacherRoute({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return setOk(false);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setOk(snap.exists() && snap.data().role === "teacher");
      } catch {
        setOk(false);
      }
    });
    return () => unsub();
  }, []);

  if (ok === null) return null; // or a loader
  return ok ? children : <Navigate to="/teacher-login" replace />;
}

// Admin guard (assuming you have one)
function AdminRouteGuard({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return setOk(false);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setOk(snap.exists() && snap.data().role === "admin");
      } catch {
        setOk(false);
      }
    });
    return () => unsub();
  }, []);

  if (ok === null) return null; // or loader
  return ok ? children : <Navigate to="/admin-login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Welcome />} />
        <Route path="/calendar-attendance" element={<CalendarAttendance attendanceArr={[]} />} />

        {/* Auth */}
        <Route path="/StudentLogin" element={<StudentLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/StudentSignup" element={<StudentSignup />} />
        <Route path="/TeacherSignup" element={<TeacherSignup />} />
        <Route path="/StudentDashboard" element={<StudentDashboard/>} />
        <Route path="/principal-login" element={<Principallogin />} />

        {/* Teacher profile */}
        <Route path="/Teacherprofile" element={<TeacherRoute><Teacherprofile /></TeacherRoute>} />

        {/* Main Teacher pages */}
        <Route path="/teacher/attendance-report" element={<TeacherRoute><AttendanceReport /></TeacherRoute>} />
        <Route path="/teacher/roster" element={<TeacherRoute><Roster /></TeacherRoute>} />
        <Route path="/teacher" element={<TeacherRoute><TeacherDashboardPage /></TeacherRoute>} />
        <Route path="/Attendance" element={<TeacherRoute><Attendance /></TeacherRoute>} />
        <Route path="/add-student" element={<TeacherRoute><AddStudent /></TeacherRoute>} />
        <Route path="/principal-desk" element={<PrincipalDesk />} />

        {/* Notices Channels */}
        <Route path="/notices/students" element={<StudentNoticeChannel />} />
        <Route path="/notices/teachers" element={<TeacherNoticeChannel />} />
        <Route path="/notices/admins" element={<AdminNoticeChannel />} />

        {/* Admin post notice (protected) */}
        <Route path="/admin/post-notice" element={<AdminRouteGuard><AdminNoticePost /></AdminRouteGuard>} />

        {/* Admin auth */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />

        {/* Admin protected */}
        <Route path="/admin/dashboard" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
        <Route path="/admin/approvals" element={<AdminRouteGuard><AdminTeacherApprovals /></AdminRouteGuard>} />
        <Route path="/admin/students" element={<AdminRouteGuard><AdminStudentList /></AdminRouteGuard>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
