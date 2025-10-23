import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PrincipalLogin() {
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
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Get profile to check role and approval

      await cred.user.getIdToken(true);
      const token = await cred.user.getIdTokenResult();
      const claimRole = token?.claims?.role;

      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const profile = snap.exists() ? snap.data() : null;

      const isPrincipal = claimRole === "principal" || profile?.role === "principal";
      if (!isPrincipal) {
        setError("Not authorized as a principal.");
        setBusy(false);
        return;
      }
      const status = profile?.status || "pending";
      if (status !== "approved") {
        setError("Approval required. Please wait for admin approval.");
        setBusy(false);
        return;
      }

      const sessionUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        role: "principal",
        name: profile?.name || "",
        status: "approved",
      };
      localStorage.setItem("user", JSON.stringify(sessionUser));
      navigate("/principal-desk", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed.");
      setBusy(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-yellow-50 p-4">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
      >
        <h1 className="text-3xl font-bold mb-6 text-yellow-800">Principal Login</h1>
        {error && <p className="mb-4 text-red-600">{error}</p>}

        <label className="block mb-2 font-semibold text-yellow-900">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 rounded border border-yellow-300 mb-4 focus:ring-2 focus:ring-yellow-400 outline-none text-yellow-900"
          placeholder="principal@example.com"
          disabled={busy}
        />

        <label className="block mb-2 font-semibold text-yellow-900">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 rounded border border-yellow-300 mb-6 focus:ring-2 focus:ring-yellow-400 outline-none text-yellow-900"
          placeholder="********"
          disabled={busy}
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-lg transition disabled:opacity-60"
        >
          {busy ? "Logging in..." : "Login"}
        </button>
      </motion.form>
    </div>
  );
}
