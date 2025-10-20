import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";                 // note: ../../
import { useTeacherData } from "../../hooks/useTeacherData"; // note: ../../
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
      sub: `Attendance marked: ${kpis?.markedCount ?? 0}/${kpis?.classesToday ?? 0}`,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <ClipboardList size={18} />
            </span>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Dashboard</h1>
              <p className="text-[12px] text-slate-500 -mt-0.5">
                Overview of today’s attendance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {teacher?.name ? `Hi, ${teacher.name}` : loading ? "Loading…" : ""}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition"
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* KPI row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-1 text-[12px] text-emerald-600">{sub}</p>
                </div>
                <span className="h-9 w-9 inline-grid place-items-center rounded-lg bg-slate-50 text-slate-500 border border-slate-200">
                  <Icon size={16} />
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Panels */}
        <section className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Class-wise Attendance */}
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Class‑wise Attendance</h2>
            <div className="mt-3 space-y-3">
              {(classWise ?? []).map((row) => (
                <div key={row.section} className="flex items-center gap-3">
                  <div className="min-w-[120px] text-sm text-slate-700">{row.section}</div>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${row.pct}%` }}
                        role="progressbar"
                        aria-valuenow={row.pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-xs text-slate-500">
                    {row.present}/{row.total}
                  </div>
                  <span className="inline-flex w-12 justify-center rounded-md bg-slate-100 text-slate-700 text-xs px-2 py-1">
                    {row.pct}%
                  </span>
                </div>
              ))}
              {(!classWise || classWise.length === 0) && (
                <p className="text-sm text-slate-500">No classes assigned.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <ul className="mt-2 divide-y divide-slate-200">
              {(activity ?? []).map((a, idx) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        a.status === "absent" ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm">
                        {a.status === "absent" ? "Student absent" : "Attendance marked"}
                      </p>
                      <p className="text-xs text-slate-500">{a.cls}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{a.time}</span>
                </li>
              ))}
              {(!activity || activity.length === 0) && (
                <li className="py-3 text-sm text-slate-500">No recent activity.</li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
