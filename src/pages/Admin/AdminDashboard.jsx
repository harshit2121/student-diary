import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { motion } from "framer-motion";
import { FilePlus2, BellRing, CheckCircle, UsersRound } from "lucide-react";

export default function AdminDashboard() {
  // Reusable animated card component
  const Card = ({ to, title, desc, icon: Icon }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 250 }}
      className="rounded-2xl bg-gradient-to-b from-yellow-50 via-white to-yellow-100 border-2 border-yellow-300 shadow-md hover:shadow-lg transition overflow-hidden"
    >
      <Link
        to={to}
        className="flex flex-col items-start gap-3 p-6 text-yellow-900 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-200 border border-yellow-400 text-yellow-800 shadow-inner">
            <Icon size={26} />
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-yellow-800/80 text-sm leading-relaxed">{desc}</p>
      </Link>
    </motion.div>
  );

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="relative min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/70 to-yellow-50 p-6 rounded-lg">
        {/* Animated floating background dots */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {[...Array(12)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-yellow-300 blur-md opacity-10"
              style={{
                top: `${Math.random() * 90}%`,
                left: `${Math.random() * 90}%`,
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
              }}
              animate={{ y: [0, -10, 0], opacity: [0.1, 0.2, 0.1] }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        <h1 className="text-3xl font-extrabold text-black-600 mb-8 tracking-wide selection:bg-yellow-300 selection:text-yellow-900">
          Adminstrator Dashboard
        </h1>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delayChildren: 0.2, staggerChildren: 0.1 },
            },
          }}
        >
          <Card
            to="/admin/approvals"
            title="Teacher Approvals"
            desc="Review and approve teachers waiting for verification."
            icon={CheckCircle}
          />
          <Card
            to="/admin/add-student"
            title="Add Student"
            desc="Create new student profiles and register users manually."
            icon={UsersRound}
          />
          <Card
            to="/admin/students"
            title="Student List"
            desc="View, search, and manage all registered students."
            icon={FilePlus2}
          />
          <Card
            to="/notices/admins"
            title="View Admin Notices"
            desc="Access all announcements posted for admins."
            icon={BellRing}
          />
          <Card
            to="/admin/post-notice"
            title="Add New Notice"
            desc="Create and publish important announcements for the platform."
            icon={FilePlus2}
          />
        </motion.div>
      </div>
    </AdminLayout>
  );
}
