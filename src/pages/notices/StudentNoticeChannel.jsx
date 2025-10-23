import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function StudentNoticeChannel() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notices"),
      where("target", "==", "student"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Student Notices</h2>
      {notices.length === 0 ? (
        <p>No notices found.</p>
      ) : (
        notices.map(({ id, title, message, createdAt }) => (
          <div key={id} className="border-l-4 border-blue-600 p-3 mb-3 bg-blue-50 rounded">
            <div className="text-sm text-gray-500">{new Date(createdAt.toDate()).toLocaleString()}</div>
            <h3 className="font-semibold">{title}</h3>
            <p className="whitespace-pre-wrap">{message}</p>
          </div>
        ))
      )}
    </div>
  );
}
