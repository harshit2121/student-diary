const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const periods = ["9-10", "10-11", "11-12", "12-1", "2-3"];

export default function Timetable() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Timetable</h2>
      <table className="table-auto border-collapse w-full text-center">
        <thead>
          <tr>
            <th className="border px-2 py-1">Time</th>
            {days.map((d) => (
              <th key={d} className="border px-2 py-1">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p}>
              <td className="border px-2 py-1">{p}</td>
              {days.map((d) => (
                <td key={d} className="border px-2 py-1">-</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
