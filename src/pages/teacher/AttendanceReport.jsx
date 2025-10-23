import React, { useState, useMemo } from "react";

export default function AttendanceReport({ classWise = [], studentsData = [] }) {
  const [selectedSection, setSelectedSection] = useState("");

  // Unique sections list for dropdown
  const sections = useMemo(() => {
    const uniqueSections = new Set(classWise.map((c) => c.section));
    return Array.from(uniqueSections).sort();
  }, [classWise]);

  // Filter data based on selected section
  const filteredClassWise = useMemo(() => {
    return selectedSection
      ? classWise.filter((c) => c.section === selectedSection)
      : classWise;
  }, [classWise, selectedSection]);

  const filteredStudents = useMemo(() => {
    return selectedSection
      ? studentsData.filter((s) => s.section === selectedSection)
      : studentsData;
  }, [studentsData, selectedSection]);

  // Calculate overall and weekly attendance for filtered classes
  const overallStats = useMemo(() => {
    if (filteredClassWise.length === 0) return { overallPct: 0, weeklyAvg: 0 };
    const totalPresent = filteredClassWise.reduce((acc, c) => acc + (c.present || 0), 0);
    const totalStudents = filteredClassWise.reduce((acc, c) => acc + (c.total || 0), 0);
    const overallPct = totalStudents ? ((totalPresent / totalStudents) * 100).toFixed(1) : "0.0";
    const weeklyAvg = (
      filteredClassWise.reduce((acc, c) => acc + (c.pct || 0), 0) / filteredClassWise.length
    ).toFixed(1);
    return { overallPct, weeklyAvg };
  }, [filteredClassWise]);

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-md shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance Report</h1>

      <div className="mb-5">
        <label htmlFor="section-select" className="block font-semibold mb-2">
          Select Class / Section:
        </label>
        <select
          id="section-select"
          className="w-full p-2 border border-gray-300 rounded"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-center">
        <div>
          <div className="text-gray-600 mb-1">Overall Attendance %</div>
          <div className="text-3xl font-semibold text-blue-600">{overallStats.overallPct}%</div>
        </div>
        <div>
          <div className="text-gray-600 mb-1">Weekly Average %</div>
          <div className="text-3xl font-semibold text-green-600">{overallStats.weeklyAvg}%</div>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-3 text-left">Student Name</th>
            <th className="border border-gray-300 p-3 text-right">Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={2} className="p-4 text-center text-gray-500 border border-gray-300">
                No data available for this section.
              </td>
            </tr>
          ) : (
            filteredStudents.map(({ id, name, attendancePercent }) => (
              <tr
                key={id}
                className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <td className="border border-gray-300 p-3">{name}</td>
                <td className="border border-gray-300 p-3 text-right">
                  {attendancePercent.toFixed(1)}%
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
