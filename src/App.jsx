import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentLogin from "./pages/student/StudentLogin";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import StudentSignup from "./pages/student/StudentSignup";
import TeacherSignup from "./pages/teacher/TeacherSignup";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Attendance from "./pages/Attendance";
import AddStudent from "./pages/teacher/AddStudent";
import Teacherprofile from "./pages/teacher/Teacherprofile";
//Admin Pages
import AdminRoute from "./pages/Admin/AdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminTeacherApprovals from "./pages/Admin/AdminTeacherApprovals";
import AdminStudentList from "./pages/Admin/AdminStudentList";
import Welcome from "./pages/Welcome";


function App() {
  return (
    <Router>
      <Routes>
        {/* Login & Signup */}
        <Route path="/StudentLogin" element={<StudentLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/StudentSignup" element={<StudentSignup />} />
        <Route path="/TeacherSignup" element={<TeacherSignup />} />
        <Route path="/Teacherprofile" element={<Teacherprofile />} />

        {/* Dashboards */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/" element={<Welcome />} />

        {/* Teacher-only pages */}
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/add-student" element={<AddStudent />} />

        {/* Admin-only pages */}
{/* Admin auth */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />

        {/* Admin protected */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/approvals" element={<AdminRoute><AdminTeacherApprovals /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><AdminStudentList /></AdminRoute>} />

        {/* Example: you can add an admin add-student page if desired (we used approvals + list here)
            <Route path="/admin/add-student" element={<AdminRoute><AdminAddStudent/></AdminRoute>} /> */}

        {/* Default redirect */}
        <Route path="*" element={<Welcome/>} />
      </Routes>
    </Router>
  );
}

export default App;
