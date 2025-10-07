import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await cred.user.getIdToken(true);
      const token = await cred.user.getIdTokenResult();
      let isAdmin = token?.claims?.role === "admin";
      if (!isAdmin) {
        const snap = await getDoc(doc(db, "users", cred.user.uid));
        isAdmin = snap.exists() && snap.data().role === "admin";
      }
      if (!isAdmin) { setError("Not authorized as admin."); return; }

      const profileSnap = await getDoc(doc(db, "users", cred.user.uid));
      const profile = profileSnap.exists() ? profileSnap.data() : { email: cred.user.email };
      localStorage.setItem("user", JSON.stringify({ ...profile, uid: cred.user.uid, role: "admin" }));
      navigate("/admin/dashboard", { state: { user: profile } });
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <motion.div aria-hidden className="absolute -inset-1" initial={{ opacity: 0.95 }}
        animate={{ opacity: [0.88,1,0.88] }} transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }}
        style={{ background:"linear-gradient(135deg, #0b1220 0%, #0e1b33 40%, #0a1a3a 100%)" }} />
      <motion.div aria-hidden className="absolute -inset-1" initial={{ opacity:0.35 }}
        animate={{ opacity:[0.28,0.5,0.28] }} transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }}
        style={{ background:"conic-gradient(from 220deg at 30% 30%, rgba(59,130,246,0.28), rgba(99,102,241,0.25), rgba(37,99,235,0.24), rgba(56,189,248,0.22), rgba(59,130,246,0.28))", filter:"blur(80px)" }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <motion.div aria-hidden className="absolute -inset-[2px] rounded-3xl blur-[12px]"
            animate={{ opacity:[0.5,0.85,0.5] }} transition={{ duration:3.2, repeat:Infinity, ease:"easeInOut" }}
            style={{ background:"linear-gradient(135deg, rgba(37,99,235,0.9), rgba(59,130,246,0.9), rgba(99,102,241,0.9))" }} />
          <div className="relative rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl p-7 sm:p-8">
            <div className="mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md mb-3" />
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-sm text-white/80">Restricted access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && <p className="text-rose-300 text-sm bg-rose-950/40 border border-rose-400/30 rounded-lg px-3 py-2">{error}</p>}
              <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }} type="submit" disabled={busy}
                className="w-full rounded-xl px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-semibold shadow-lg">
                {busy ? "Authenticating…" : "Login"}
              </motion.button>
              <p className="text-white/90 text-sm text-center">
                Need an account? <Link to="/admin-signup" className="underline font-semibold">Admin Signup</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
