import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { User, Mail, Phone, ShieldCheck, School, Calendar, Save } from "lucide-react";

const Teacherprofile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(location.state?.user || null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    class: "",
    section: "",
    doj: "",
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    const base = teacher || stored;
    if (!base || base.role !== "teacher") {
      navigate("/TeacherLogin");
      return;
    }
    setTeacher(base);
    setForm((f) => ({
      ...f,
      name: base.name || "",
      email: base.email || "",
      phone: base.phone || "",
      subject: base.subject || "",
      class: base.class || "",
      section: base.section || "",
      doj: base.doj || "",
    }));
  }, [teacher, navigate]);

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const handleSave = async () => {
    setSaving(true);
    setSavedMsg("");
    try {
      const updated = { ...teacher, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setTeacher(updated);
      setSavedMsg("Profile updated successfully.");
    } catch {
      setSavedMsg("Failed to save profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  // Golden dust particles (no Lottie)
  const dust = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 14 + Math.random() * 10,
        scale: 0.5 + Math.random() * 0.9,
        opacity: 0.10 + Math.random() * 0.18,
      })),
    []
  );

  // Card tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useTransform(my, [-40, 40], [6, -6]);
  const rY = useTransform(mx, [-40, 40], [-8, 8]);

  return (
    <div className="relative min-h-screen overflow-hidden text-amber-900">
      {/* Golden base gradient */}
      <motion.div
        aria-hidden
        className="absolute -inset-1"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(135deg, #fff3bf 0%, #ffd166 45%, #f59f00 100%)",
        }}
      />
      {/* Sun‑ray conic glow (animated) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 200deg at 30% 30%, rgba(250,204,21,0.35), rgba(217,119,6,0.28), rgba(161,98,7,0.25), rgba(250,204,21,0.35))",
          filter: "blur(80px)",
        }}
      />
      {/* Floating gold dust */}
      <div className="pointer-events-none absolute inset-0">
        {dust.map((d) => (
          <motion.div
            key={d.id}
            className="absolute top-[-10vh]"
            style={{ left: d.left }}
            initial={{ y: "-10vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "115vh",
              rotate: [0, 16, -8, 12, 0],
              opacity: [0, d.opacity, d.opacity, 0],
            }}
            transition={{
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="h-3 w-14 rounded-full"
              style={{
                transform: `scale(${d.scale})`,
                background:
                  "linear-gradient(90deg, rgba(253,224,71,0.00) 0%, rgba(253,224,71,0.45) 30%, rgba(245,158,11,0.45) 60%, rgba(217,119,6,0.45) 100%)",
                filter: "blur(1.2px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-5xl mx-auto pt-12 px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
          Faculty Profile
        </h1>
        <p className="text-amber-800/90 mt-1">Manage personal information and class assignment.</p>
      </div>

      {/* Profile card with tilt and glossy accents */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto mt-6 px-6"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - rect.left - rect.width / 2);
          my.set(e.clientY - rect.top - rect.height / 2);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX: rX, rotateY: rY, transformStyle: "preserve-3d" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: avatar + facts */}
          <div className="md:col-span-1 relative">
            {/* Gold rim glow */}
            <motion.div
              aria-hidden
              className="absolute -inset-[2px] rounded-3xl blur-xl"
              animate={{ opacity: [0.45, 0.8, 0.45] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(250,204,21,0.8), rgba(245,158,11,0.8), rgba(217,119,6,0.8))",
              }}
            />
            <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-amber-200 p-6 text-center shadow-xl">
              <div className="mx-auto mb-4 relative">
                {/* Avatar circle with shimmer (no external asset) */}
                <div className="h-28 w-28 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-3xl font-bold text-amber-800 shadow-inner relative overflow-hidden">
                  {(teacher?.name || "T")[0]?.toUpperCase()}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0"
                    initial={{ x: "-120%" }}
                    animate={{ x: ["-120%", "120%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                    style={{
                      background:
                        "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)",
                    }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-amber-900">{teacher?.name || "Teacher"}</h3>
              <p className="text-amber-800/80 text-sm mt-1 flex items-center gap-2 justify-center">
                <ShieldCheck size={16} /> Verified • {teacher?.role || "teacher"}
              </p>

              <div className="mt-5 space-y-2 text-left text-amber-900">
                <p className="flex items-center gap-2"><Mail size={16} /> {teacher?.email || "-"}</p>
                <p className="flex items-center gap-2"><Phone size={16} /> {teacher?.phone || "-"}</p>
                <p className="flex items-center gap-2"><School size={16} /> Class {teacher?.class || "-"} • Section {teacher?.section || "-"}</p>
                <p className="flex items-center gap-2"><Calendar size={16} /> DOJ {teacher?.doj || "-"}</p>
              </div>
            </div>
          </div>

          {/* Right: editable form */}
          <div className="md:col-span-2 relative">
            <motion.div
              aria-hidden
              className="absolute -inset-[2px] rounded-3xl blur-xl"
              animate={{ opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(250,204,21,0.8), rgba(245,158,11,0.8), rgba(217,119,6,0.8))",
              }}
            />
            <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-amber-200 p-6 shadow-xl">
              <h4 className="text-lg font-semibold text-amber-900 mb-4">Edit Details</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Full Name"
                  className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email"
                  className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Phone"
                  className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Subject"
                  className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <input
                  type="text"
                  value={form.class}
                  onChange={(e) => handleChange("class", e.target.value)}
                  placeholder="Class"
                  className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  placeholder="Section"
                  className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <input
                  type="date"
                  value={form.doj}
                  onChange={(e) => handleChange("doj", e.target.value)}
                  placeholder="Date of Joining"
                  className="border border-amber-200 bg-white text-amber-900 rounded-xl p-3 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving}
                onClick={handleSave}
                className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 border border-amber-300 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-amber-900 font-semibold hover:from-amber-200 hover:to-amber-400 shadow-md disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Saving…" : "Save Changes"}
              </motion.button>

              {savedMsg && <p className="mt-3 text-sm text-amber-800">{savedMsg}</p>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 text-amber-900/90 text-sm text-center mt-10 pb-6">
        ERP BY HARSHIT PARMAR {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Teacherprofile;
