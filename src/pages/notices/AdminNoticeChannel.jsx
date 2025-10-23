import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  bg: "#fffbeb",
  cardBg: "#fff6b8",
  borderYellow: "#facc15",
  textPrimary: "#784f04",
  textSecondary: "#ad8d25",
};

export default function AdminNoticeChannel() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notices"),
      where("target", "==", "admin"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div
      className="p-8 max-w-3xl mx-auto rounded-3xl shadow-lg"
      style={{
        backgroundColor: COLORS.bg,
        border: `3px solid ${COLORS.borderYellow}`,
      }}
    >
      <h2
        className="text-4xl font-extrabold mb-8"
        style={{ color: COLORS.textPrimary, textShadow: "0 0 7px #facc15" }}
      >
        Admin Notices
      </h2>

      <AnimatePresence>
        {notices.length === 0 ? (
          <motion.p
            className="text-xl font-semibold text-center"
            style={{ color: COLORS.textSecondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No notices found.
          </motion.p>
        ) : (
          notices.map(({ id, title, message, createdAt }) => (
            <motion.div
              key={id}
              className="mb-6 rounded-lg border-l-8 pl-6 pr-4 py-4"
              style={{
                borderColor: COLORS.borderYellow,
                backgroundColor: COLORS.cardBg,
                boxShadow: "0 2px 8px rgb(250 204 21 / 0.2)"
              }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.03, boxShadow: "0 4px 15px rgb(250 204 21 / 0.4)" }}
            >
              <div className="text-sm mb-1" style={{ color: COLORS.textSecondary }}>
                {createdAt?.toDate ? new Date(createdAt.toDate()).toLocaleString() : ""}
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                {title}
              </h3>
              <p style={{ whiteSpace: "pre-wrap", color: COLORS.textSecondary }}>{message}</p>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
