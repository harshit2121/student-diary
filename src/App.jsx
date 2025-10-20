import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// Auth pages
import StudentLogin from "./pages/student/StudentLogin";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import StudentSignup from "./pages/student/StudentSignup";
import TeacherSignup from "./pages/teacher/TeacherSignup";

// Dashboards and pages
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage"; // uses TeacherShell + TeacherDashboard
import Attendance from "./pages/Attendance";
import AddStudent from "./pages/teacher/AddStudent";
import Teacherprofile from "./pages/teacher/Teacherprofile";
import Welcome from "./pages/Welcome";
import Roster from "./pages/teacher/StudentRoster";

// Admin
import AdminRoute from "./pages/Admin/AdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminTeacherApprovals from "./pages/Admin/AdminTeacherApprovals";
import AdminStudentList from "./pages/Admin/AdminStudentList";

// Simple teacher route guard using Firestore role
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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Welcome />} />

        {/* Auth */}
        <Route path="/StudentLogin" element={<StudentLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/StudentSignup" element={<StudentSignup />} />
        <Route path="/TeacherSignup" element={<TeacherSignup />} />

        {/* Teacher profile (protected) */}
        <Route
          path="/Teacherprofile"
          element={
            <TeacherRoute>
              <Teacherprofile />
            </TeacherRoute>
          }
        />
<Route path="/teacher/roster" element={<Roster />} />
        {/* Student dashboard */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        {/* Teacher routes with sidebar layout */}
        <Route
          path="/teacher"
          element={
            <TeacherRoute>
              <TeacherDashboardPage />
            </TeacherRoute>
          }
        />
        <Route
          path="/Attendance"
          element={
            <TeacherRoute>
              <Attendance />
            </TeacherRoute>
          }
        />
        <Route
          path="/teacher/reports"
          element={
            <TeacherRoute>
              <TeacherDashboardPage />
            </TeacherRoute>
          }
        />
        <Route
          path="/teacher/calendar"
          element={
            <TeacherRoute>
              <TeacherDashboardPage />
            </TeacherRoute>
          }
        />
        <Route
          path="/teacher/roster"
          element={
            <TeacherRoute>
              <TeacherDashboardPage />
            </TeacherRoute>
          }
        />

        {/* Optional teacher utility pages (keep routes working) */}
        <Route
          path="/add-student"
          element={
            <TeacherRoute>
              <AddStudent />
            </TeacherRoute>
          }
        />

        {/* Admin auth */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />

        {/* Admin protected */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <AdminRoute>
              <AdminTeacherApprovals />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <AdminStudentList />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}