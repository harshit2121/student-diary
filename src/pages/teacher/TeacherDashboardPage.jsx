// src/pages/teacher/TeacherDashboardPage.jsx
import React from "react";
import TeacherShell from "../../layouts/TeacherShell";
import TeacherDashboard from "./TeacherDashboard";

export default function TeacherDashboardPage() {
  return (
    <TeacherShell>
      <TeacherDashboard />
    </TeacherShell>
  );
}
