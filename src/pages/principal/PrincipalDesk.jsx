import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function Dashboard() {
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [weeklyAvg, setWeeklyAvg] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
        
        // Today's attendance
        const qPresent = query(collection(db, "attendance"), where("date", "==", today), where("status", "==", "Present"));
        const snapPresent = await getDocs(qPresent);
        setTotalPresent(snapPresent.size);

        const qAbsent = query(collection(db, "attendance"), where("date", "==", today), where("status", "==", "Absent"));
        const snapAbsent = await getDocs(qAbsent);
        setTotalAbsent(snapAbsent.size);

        // Weekly avg (data from last 7 days)
        let sumPercent = 0;
        for(let i=0; i<7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().slice(0,10);
          const qDay = query(collection(db, "attendance"), where("date", "==", dateStr));
          const snapDay = await getDocs(qDay);
          if(snapDay.size > 0) {
            let present = 0;
            snapDay.forEach(doc => {
              if(doc.data().status === "Present") present++;
            });
            sumPercent += (present / snapDay.size) * 100;
          }
        }
        setWeeklyAvg(Math.round(sumPercent / 7));
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <section className="max-w-4xl mx-auto bg-yellow-50 rounded-3xl p-6 shadow-lg border border-yellow-300 text-yellow-900">
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      {loading ? (
        <p>Loading stats…</p>
      ) : (
        <div className="flex flex-col sm:flex-row justify-around gap-8 text-center text-xl font-semibold">
          <span>Total Present Today: <span className="text-green-700">{totalPresent}</span></span>
          <span>Total Absent Today: <span className="text-red-700">{totalAbsent}</span></span>
          <span>Weekly Avg Attendance: <span className="text-yellow-700">{weeklyAvg}%</span></span>
        </div>
      )}
    </section>
  );
}
