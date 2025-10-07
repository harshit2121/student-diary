import { useState } from "react";

export default function Assignments({ user }) {
  const [assignments, setAssignments] = useState([
    { id: 1, title: "Math Homework", desc: "Chapter 3 exercises" },
    { id: 2, title: "Science Project", desc: "Volcano model" },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addAssignment = () => {
    if (!newTitle) return alert("Enter title");
    setAssignments([
      ...assignments,
      { id: Date.now(), title: newTitle, desc: newDesc },
    ]);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Assignments</h2>

      {user.role === "teacher" && (
        <div className="mb-4">
          <input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            placeholder="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={addAssignment}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {assignments.map((a) => (
          <li
            key={a.id}
            className="p-3 rounded shadow-sm border hover:shadow-md transition bg-gray-50"
          >
            <h3 className="font-semibold text-gray-800">{a.title}</h3>
            <p className="text-gray-600">{a.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
