import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useTeacherData } from "../../hooks/useTeacherData";
import {
  CalendarDays,
  ClipboardList,
  LogOut,
  Users,
  TrendingUp,
  Gauge,
} from "lucide-react";

export default function TeacherDashboard() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  const { loading, teacher, kpis, classWise, activity } = useTeacherData(uid);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const cards = [
    { label: "Today's Attendance", value: `${kpis?.todayPct ?? 0}%`, sub: "Live today", icon: Gauge },
    { label: "Present Students", value: kpis?.presentCount ?? "0/0", sub: "Out of total students", icon: Users },
    { label: "Weekly Average", value: `${kpis?.weeklyAvg ?? 0}%`, sub: "Last 7 days", icon: TrendingUp },
    {
      label: "Classes Today",
      value: `${kpis?.classesToday ?? 0}`,
      sub: `Marked: ${kpis?.markedCount ?? 0}/${kpis?.classesToday ?? 0}`,
      icon: CalendarDays,
    },
  ];

  if (!uid) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-600">
        Checking authentication…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <ClipboardList size={18} />
            </span>
            <div className="flex flex-col leading-tight">
              <h1 className="text-base sm:text-lg font-semibold">Dashboard</h1>
              <p className="text-[11px] sm:text-[12px] text-slate-500">Today's attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:block text-sm text-slate-600">
              {teacher?.name ? `Hi, ${teacher.name}` : ""}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 sm:gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm hover:bg-slate-50 transition"
            >
              <LogOut size={14} className="sm:size-16" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-6">
        {/* KPI row */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map(({ label, value, sub, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl bg-white border border-slate-200 p-3 sm:p-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[12px] sm:text-[13px] text-slate-500">{label}</p>
                  <p className="mt-1 text-lg sm:text-2xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-1 text-[11px] sm:text-[12px] text-emerald-600">{sub}</p>
                </div>
                <span className="mt-2 sm:mt-0 h-8 w-8 sm:h-9 sm:w-9 inline-grid place-items-center rounded-lg bg-slate-50 text-slate-500 border border-slate-200">
                  <Icon size={15} />
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Panels */}
        <section className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Class-wise Attendance */}
          <div className="rounded-xl bg-white border border-slate-200 p-3 sm:p-4 shadow-sm overflow-x-auto">
            <h2 className="text-base sm:text-lg font-semibold">Class-wise Attendance</h2>
            <div className="mt-3 space-y-3 min-w-[320px]">
              {(classWise ?? []).map((row) => (
                <div key={row.section} className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="min-w-[80px] sm:min-w-[120px] text-xs sm:text-sm text-slate-700">{row.section}</div>
                  <div className="flex-1 min-w-[100px]">
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-14 sm:w-16 text-right text-[11px] sm:text-xs text-slate-500">
                    {row.present}/{row.total}
                  </div>
                  <span className="inline-flex w-10 sm:w-12 justify-center rounded-md bg-slate-100 text-slate-700 text-[11px] sm:text-xs px-2 py-0.5">
                    {row.pct}%
                  </span>
                </div>
              ))}
              {(!classWise || classWise.length === 0) && (
                <p className="text-xs sm:text-sm text-slate-500">No classes assigned.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl bg-white border border-slate-200 p-3 sm:p-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold">Recent Activity</h2>
            <ul className="mt-2 divide-y divide-slate-200">
              {(activity ?? []).map((a, idx) => (
                <li
                  key={idx}
                  className="py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span
                      className={`mt-1 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                        a.status === "absent" ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    <div>
                      <p className="text-xs sm:text-sm">
                        {a.status === "absent" ? "Student absent" : "Attendance marked"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500">{a.cls}</p>
                    </div>
                  </div>
                  <span className="mt-1 sm:mt-0 text-[10px] sm:text-xs text-slate-500">
                    {a.time}
                  </span>
                </li>
              ))}
              {(!activity || activity.length === 0) && (
                <li className="py-2 sm:py-3 text-xs sm:text-sm text-slate-500">
                  No recent activity.
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
