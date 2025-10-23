import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { motion } from "framer-motion";

const COLORS = {
  bg: "#fffbeb",
  inputBg: "#fff9c4",
  borderYellow: "#facc15",
  buttonBg: "#facc15",
  buttonHover: "#eab308",
  textPrimary: "#78350f",
  textSuccessBg: "#d9f99d",
  textSuccess: "#4d7c0f",
};

export default function AdminNoticePost() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("student");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Please fill all fields.");

    setLoading(true);
    try {
      await addDoc(collection(db, "notices"), {
        title,
        message,
        target,
        createdAt: serverTimestamp(),
      });
      setSuccess("Notice posted successfully!");
      setTitle("");
      setMessage("");
      setTarget("student");
      setTimeout(() => setSuccess(""), 4000);
    } catch (error) {
      alert("Error posting notice: " + error.message);
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="max-w-lg mx-auto p-8 rounded-xl shadow-lg"
      style={{ backgroundColor: COLORS.bg }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-extrabold mb-6" style={{ color: COLORS.textPrimary }}>
        Post New Notice
      </h2>
      {success && (
        <motion.div
          className="p-3 rounded mb-5"
          style={{ backgroundColor: COLORS.textSuccessBg, color: COLORS.textSuccess }}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {success}
        </motion.div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg p-3 border focus:outline-none focus:ring-2"
            placeholder="Enter notice title"
            required
            style={{
              backgroundColor: COLORS.inputBg,
              borderColor: COLORS.borderYellow,
              color: COLORS.textPrimary,
            }}
          />
        </div>
        <div>
          <label className="block font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg p-3 border focus:outline-none focus:ring-2 resize-y"
            rows={6}
            placeholder="Enter notice message"
            required
            style={{
              backgroundColor: COLORS.inputBg,
              borderColor: COLORS.borderYellow,
              color: COLORS.textPrimary,
            }}
          />
        </div>
        <div>
          <label className="block font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
            Target Audience
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-lg p-3 border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: COLORS.inputBg,
              borderColor: COLORS.borderYellow,
              color: COLORS.textPrimary,
            }}
          >
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg p-3 font-semibold shadow"
          style={{
            backgroundColor: COLORS.buttonBg,
            color: COLORS.textPrimary,
          }}
          whileHover={{ backgroundColor: COLORS.buttonHover, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? "Posting..." : "Post Notice"}
        </motion.button>
      </form>
    </motion.div>
  );
}
