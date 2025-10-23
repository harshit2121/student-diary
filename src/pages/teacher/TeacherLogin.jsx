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
      // Sign in
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Claims + profile
      await cred.user.getIdToken(true);
      const token = await cred.user.getIdTokenResult();
      const claimRole = token?.claims?.role;

      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const profile = snap.exists() ? snap.data() : null;

      const isTeacher = claimRole === "teacher" || profile?.role === "teacher";
      if (!isTeacher) {
        setError("Not authorized as a teacher.");
        setBusy(false);
        return;
      }
      const status = profile?.status || "pending";
      if (status !== "approved") {
        setError("Approval required. Please wait for admin approval.");
        setBusy(false);
        return;
      }

      // Store minimal session info
      const sessionUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        role: "teacher",
        name: profile?.name || "",
        classes: profile?.classes || [],
        status: "approved",
      };
      localStorage.setItem("user", JSON.stringify(sessionUser));

      // NEW: redirect to sidebar dashboard route
      navigate("/teacher", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-50">
      {/* Background glows */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.25, 0.45, 0.25] }}f
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 140deg at 20% 30%, rgba(250,204,21,0.25), rgba(217,119,6,0.15), rgba(250,204,21,0.25))",
          filter: "blur(80px)",
        }}
      />

      {/* Central card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl p-8 bg-yellow-100/90 shadow-lg"
          style={{
            border: "1px solid rgba(252, 186, 3, 0.5)",
            boxShadow: "0 20px 50px rgba(250, 204, 21, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {/* Glow animation behind */}
          <motion.span
            aria-hidden
            className="absolute -inset-[3px] rounded-3xl blur-xl"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(135deg, rgba(250,204,21,0.75), rgba(217,119,6,0.75), rgba(161,98,7,0.75))",
              zIndex: -1,
            }}
          />

          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-lg shadow-inner" />
            <div>
              <h2 className="text-yellow-900 text-3xl font-extrabold tracking-wide select-none">
                Faculty Login
              </h2>
              <p className="text-yellow-700 text-sm">Welcome back to CM RISE ERP</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="px-3 py-2 rounded bg-red-300 text-red-900 text-center font-semibold"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-yellow-800 font-semibold mb-2">Email</label>
              <motion.input
                whileFocus={{ scale: 1.03 }}
                type="email"
                placeholder="name@example.com"
                className="w-full p-3 rounded-xl border border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-inner text-yellow-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-yellow-800 font-semibold mb-2">Password</label>
              <motion.input
                whileFocus={{ scale: 1.03 }}
                type="password"
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-inner text-yellow-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              type="submit"
              className="relative w-full py-3 rounded-xl font-bold text-yellow-900 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-lg hover:from-yellow-300 hover:to-orange-500 transition disabled:opacity-50"
            >
              {busy ? "Authenticating..." : "Login"}
            </motion.button>

            <p className="text-yellow-700/80 text-center text-sm">
              Don’t have an account?{" "}
              <Link to="/TeacherSignup" className="underline font-semibold hover:text-yellow-800">
                Signup
              </Link>
            </p>

            <p className="text-yellow-700/70 text-center text-xs mt-2">
              Only Use when Authorized, Misuse is prohibited.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
