import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { User, ClipboardList, UserPlus, LogOut } from "lucide-react";

const TeacherDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(location.state?.user || null);

  useEffect(() => {
    if (!teacher) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser.role === "teacher") {
        setTeacher(storedUser);
      } else {
        navigate("/teacher-login");
      }
    } else {
      localStorage.setItem("user", JSON.stringify(teacher));
    }
  }, [teacher, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/teacher-login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌞";
    if (hour < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const menuItems = [
    { title: "Mark Attendance", icon: <ClipboardList size={32} />, action: () => navigate("/Attendance") },
    { title: "Add Student", icon: <UserPlus size={32} />, action: () => navigate("/add-student") },
    { title: "Teacher Profile", icon: <User size={32} />, action: () => navigate("/Teacherprofile") },
  ];

  // Floating gold dust
  const feathers = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 14 + Math.random() * 10,
        scale: 0.7 + Math.random() * 0.9,
        opacity: 0.12 + Math.random() * 0.18,
      })),
    []
  );

  // Tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useTransform(my, [-40, 40], [6, -6]);
  const rY = useTransform(mx, [-40, 40], [-8, 8]);

  return (
    <div className="relative min-h-screen text-brown-900 overflow-hidden">
      {/* Golden sky */}
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
      {/* Sun-ray aurora in gold */}
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

      {/* Floating glitter */}
      <div className="pointer-events-none absolute inset-0">
        {feathers.map((f) => (
          <motion.div
            key={f.id}
            className="absolute top-[-10vh]"
            style={{ left: f.left }}
            initial={{ y: "-10vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "115vh",
              rotate: [0, 18, -10, 14, 0],
              opacity: [0, f.opacity, f.opacity, 0],
            }}
            transition={{
              duration: f.duration,
              delay: f.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="h-4 w-16 rounded-full"
              style={{
                transform: `scale(${f.scale})`,
                background:
                  "linear-gradient(90deg, rgba(253,224,71,0.00) 0%, rgba(253,224,71,0.45) 30%, rgba(245,158,11,0.45) 60%, rgba(217,119,6,0.45) 100%)",
                filter: "blur(1.2px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-10 pt-16"
      >
        <h1 className="text-4xl font-bold text-brown-900 drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
          {getGreeting()}
        </h1>
        <p className="text-lg mt-2 font-medium text-brown-800 drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
          Welcome, {teacher?.name || "Teacher"} 🦚
        </p>
      </motion.div>

      {/* Menu grid with tilt */}
      <motion.div
        className="relative z-10"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-11/12 max-w-3xl mx-auto">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.action}
              className="relative cursor-pointer"
            >
              {/* Gold rim glow */}
              <motion.div
                aria-hidden
                className="absolute -inset-[2px] rounded-2xl blur-[10px]"
                animate={{ opacity: [0.5, 0.85, 0.5] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(250,204,21,0.9), rgba(245,158,11,0.9), rgba(217,119,6,0.9))",
                }}
              />
              {/* Card */}
              <div className="relative bg-white/85 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-amber-200 text-center">
                <div className="flex justify-center mb-4 text-amber-700 drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                  {item.icon}
                </div>
                <h2 className="text-xl font-semibold text-amber-900">{item.title}</h2>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Logout button */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 absolute top-6 right-6 bg-white/70 hover:bg-white/80 text-amber-900 p-3 rounded-full border border-amber-300 shadow-lg"
        title="Logout"
      >
        <LogOut size={22} />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          initial={{ x: "-120%" }}
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
          }}
        />
      </motion.button>

      {/* Footer */}
      <footer className="relative z-10 text-brown-800 text-sm text-center mt-10 pb-6">
        ERP BY HARSHIT PARMAR {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default TeacherDashboard;
