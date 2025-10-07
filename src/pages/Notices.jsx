import { useState } from "react";

export default function Notices({ user }) {
  const [notices, setNotices] = useState([
    { id: 1, text: "School will be closed on Friday" },
    { id: 2, text: "Submit assignments by Monday" },
  ]);

  const [newNotice, setNewNotice] = useState("");

  const addNotice = () => {
    if (!newNotice) return alert("Enter notice text");
    setNotices([...notices, { id: Date.now(), text: newNotice }]);
    setNewNotice("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notices</h2>

      {user.role === "teacher" && (
        <div className="mb-4">
          <input
            placeholder="Enter notice"
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={addNotice}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Add Notice
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {notices.map((n) => (
          <li
            key={n.id}
            className="p-3 rounded shadow-sm border hover:shadow-md transition bg-yellow-50"
          >
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
