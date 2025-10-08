import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setBusy(true);
  try {
    // 1) Sign in
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // 2) Refresh token and read claims
    await cred.user.getIdToken(true);
    const token = await cred.user.getIdTokenResult();
    const claimRole = token?.claims?.role;

    // 3) Load profile (authoritative for status and display)
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const profile = snap.exists() ? snap.data() : null;

    // 4) Must be teacher by claim or profile.role
    const isTeacher =
      claimRole === "teacher" || (profile && profile.role === "teacher");

    if (!isTeacher) {
      setError("Not authorized as a teacher.");
      return;
    }

    // 5) Must be approved by admin
    const status = profile?.status || "pending";
    if (status !== "approved") {
      setError("Approval required. Please wait for admin approval.");
      // Optional: sign out to avoid leaving an authenticated but unapproved session
      // await auth.signOut();
      return;
    }

    // 6) Build safe session object
    const sessionUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      role: "teacher",
      ...profile, // includes name/phone/status (already "approved")
    };

    localStorage.setItem("user", JSON.stringify(sessionUser));
    navigate("/teacher-dashboard", { state: { user: sessionUser } });
  } catch (err) {
    setError(err?.message || "Login failed.");
  } finally {
    setBusy(false);
  }
};
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Warm sunburst yellow background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px 600px at 20% 20%, rgba(253,224,71,0.55), transparent 60%), radial-gradient(900px 700px at 80% 30%, rgba(250,204,21,0.45), transparent 60%), linear-gradient(180deg, #fffbe6 0%, #fff3bf 40%, #ffe08a 100%)",
        }}
      />
      {/* Subtle animated sun rays */}
      <motion.div
        aria-hidden
        className="absolute -inset-1"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 140deg at 30% 20%, rgba(250,204,21,0.25), rgba(217,119,6,0.18), rgba(250,204,21,0.25))",
          filter: "blur(60px)",
        }}
      />

      {/* Center card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl p-7 sm:p-9"
          style={{
            background:
              "linear-gradient(180deg, rgba(120,53,15,0.90) 0%, rgba(88,28,7,0.92) 100%)",
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {/* Rim glow */}
          <motion.span
            aria-hidden
            className="absolute -inset-[2px] rounded-[26px] blur-[12px]"
            animate={{ opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(135deg, rgba(250,204,21,0.85), rgba(217,119,6,0.85), rgba(161,98,7,0.85))",
              zIndex: -1,
            }}
          />

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-inner" />
            <div>
              <h2 className="text-white text-2xl font-semibold tracking-wide">
                Faculty Login 🦚
              </h2>
              <p className="text-yellow-100/90 text-s text-white">Welcome back to CM RISE ERP</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <AnimatePresence>
              {error && (
                <motion.p
                  key="err"
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  className="text-rose-200 text-center text-sm"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <label className="text-yellow-100/90 text-s px-2 text-white">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">📧</span>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                placeholder="name@example.com"
                className="w-full pl-10 p-3 rounded-xl bg-white/90 text-white placeholder-slate-500 focus:outline-none shadow-inner text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="text-yellow-100/90 text-s px-2 text-white">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">🔒</span>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 p-3 rounded-xl bg-white/90 text-slate-900 placeholder-slate-500 focus:outline-none shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-300 hover:to-orange-500 text-brown-900 py-3 rounded-xl transition shadow-lg shadow-amber-900/30 disabled:opacity-70"
              type="submit"
            >
              <span className="relative z-10">{busy ? "Authenticating..." : "Login"}</span>
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-xl"
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                }}
              />
            </motion.button>

            <p className="text-yellow-50/90 text-sm text-center text-white">
              Don’t have an account?{" "}
              <Link to="/TeacherSignup" className="underline font-semibold">
                Signup
              </Link>
            </p>

            <p className="text-[12px] text-yellow-50/90 text-center mt-2 text-white"> 
             Only Use when Authorized, Misuse is prohibited.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
