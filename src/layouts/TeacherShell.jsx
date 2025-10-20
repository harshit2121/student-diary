// src/layouts/TeacherShell.jsx
import React from "react";
import {
  LayoutGrid,
  ClipboardList,
  FileText,
  CalendarDays,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function TeacherShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#f3f4f8] border-r border-slate-200">
          {/* Brand */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200">
            <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <LayoutGrid size={18} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">ERP Student Diary</p>
              <p className="text-[11px] text-slate-500">Attendance System</p>
            </div>
          </div>

          {/* Menu */}
          <div className="px-3 pt-3 pb-6">
            <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-slate-500">
              Menu
            </p>
            <nav className="mt-1 space-y-1">
              <Item to="/teacher" icon={LayoutGrid} label="Dashboard" />
              <Item to="/Attendance" icon={ClipboardList} label="Mark Attendance" />
              <Item to="/teacher/reports" icon={FileText} label="Attendance Report" />
              <Item to="/teacher/calendar" icon={CalendarDays} label="Calendar View" />
              <Item to="/teacher/roster" icon={Users} label="Student Roster" />
            </nav>
          </div>
        </aside>

        {/* Content area */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function Item({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-md px-2.5 py-2 text-[14px] transition",
          isActive
            ? "bg-white shadow-sm border border-slate-200 text-slate-900 ring-1 ring-blue-300/40"
            : "text-slate-700 hover:bg-white hover:shadow-sm hover:border hover:border-slate-200",
        ].join(" ")
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
