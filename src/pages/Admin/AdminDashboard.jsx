import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  const Card = ({ to, title, desc }) => (
    <Link to={to} className="rounded-2xl bg-white/10 border border-white/20 p-6 hover:bg-white/15 transition">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-white/80 text-sm mt-1">{desc}</p>
    </Link>
  );

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card to="/admin/approvals" title="Teacher Approvals" desc="Review and approve teacher signup requests." />
        <Card to="/admin/add-student" title="Add Student" desc="Create student profiles for signup." />
        <Card to="/admin/students" title="Student List" desc="Filter by class and section." />
      </div>
    </AdminLayout>
  );
}
