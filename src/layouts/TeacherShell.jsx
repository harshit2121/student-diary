import React, { useState } from "react";
import {
  LayoutGrid,
  ClipboardList,
  FileText,
  CalendarDays,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function TeacherShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 flex flex-col md:flex-row">
      {/* Header with menu toggle for mobile */}
      <header className="md:hidden p-4 bg-[#f3f4f8] border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 cursor-pointer" onClick={toggleSidebar}>
            <LayoutGrid size={18}/>
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">ERP Student Diary</p>
            <p className="text-[11px] text-slate-500">Attendance System</p>
          </div>
        </div>
        {/* Optional: close button for sidebar on mobile */}
      </header>

      {/* Sidebar for desktop & drawer for mobile */}
      {/* Overlay for mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-100 z-40 md:hidden" onClick={toggleSidebar} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#f3f4f8] border-r border-slate-200 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 md:relative md:translate-x-0 md:static md:w-auto`}
      >
        {/* Sidebar Content */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 justify-between md:flex-col md:h-auto md:py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <LayoutGrid size={18} />
            </span>
            <div className="leading-tight md:text-center">
              <p className="text-sm font-semibold">ERP Student Diary</p>
              <p className="text-[11px] text-slate-500">Attendance System</p>
            </div>
          </div>
          {/* Optional close button on mobile sidebar */}
          {sidebarOpen && (
            <button
              className="absolute top-2 right-2 md:hidden"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Menu Items */}
        <div className="px-3 pt-3 pb-6 md:pt-4 md:px-4">
          <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-slate-500 mb-2">
            Menu
          </p>
          <nav className="mt-1 space-y-1 flex flex-col">
            <Item to="/teacher" icon={LayoutGrid} label="Dashboard" />
            <Item to="/Attendance" icon={ClipboardList} label="Mark Attendance" />
            <Item to="/teacher/reports" icon={FileText} label="Attendance Report" />
            <Item to="/teacher/calendar" icon={CalendarDays} label="Calendar View" />
            <Item to="/teacher/roster" icon={Users} label="Student Roster" />
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-4 md:p-6">{children}</main>
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
