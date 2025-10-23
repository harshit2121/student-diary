import React, { useMemo } from "react";
import { motion } from "framer-motion";

// Usage: <CalendarAttendance attendanceArr={attendance} />
// attendanceArr = [{date: "2025-10-19", status: "Present"|"Absent"}, ...]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August","September", "October", "November", "December"
];

export default function CalendarAttendance({ attendanceArr, year, month }) {
  // Default to this month
  const today = new Date();
  year = year || today.getFullYear();
  month = typeof month === 'number' ? month : today.getMonth();  // 0-indexed

  // Fast lookup for O(1) status
  const lookup = useMemo(() => {
    const dict = {};
    attendanceArr.forEach(a => {
      dict[a.date] = a.status;
    });
    return dict;
  }, [attendanceArr]);

  // Build days of grid
  const firstDay = new Date(year, month, 1).getDay();
  const numDays = new Date(year, month + 1, 0).getDate();
  const cells = [];

  // Pad start
  for (let i = 0; i < firstDay; ++i) cells.push(null);

  for (let d = 1; d <= numDays; ++d) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ d, dateStr, status: lookup[dateStr] });
  }

  // Render
  return (
    <motion.div 
      layout 
      className="max-w-md w-full mx-auto p-4 bg-white shadow-2xl rounded-2xl"
      initial={{ y: 14, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {monthNames[month]} {year}
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          {today.getFullYear() === year && today.getMonth() === month ? 
           `Today: ${today.getDate()}` : ""}
        </span>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d, i) => (
          <span key={i} className="text-xs text-slate-400 font-bold text-center">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => cell ? (
          <motion.div 
            key={i} 
            whileHover={cell.status ? { scale: 1.09 } : undefined}
            className={[
              "aspect-square h-9 w-9 flex flex-col items-center justify-center rounded-lg mx-auto font-medium select-none text-xs",
              cell.dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}` && "border-2 border-blue-400",
              cell.status === "Present" && "bg-green-500/80 text-white shadow",
              cell.status === "Absent" && "bg-red-500/80 text-white",
              !cell.status && "bg-gray-200 text-slate-400",
            ].filter(Boolean).join(" ")}
            title={cell.status ? `${cell.status} on ${cell.dateStr}` : cell.dateStr}
          >
            {cell.d}
          </motion.div>
        ) : (
          <span key={i} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 mt-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-500 rounded" /> Present
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-red-500 rounded" /> Absent
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-gray-300 rounded" /> Unmarked
        </span>
      </div>
    </motion.div>
  );
}
