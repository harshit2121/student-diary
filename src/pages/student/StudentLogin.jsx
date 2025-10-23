import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Redirect only after Firebase auth state confirms login
      navigate("/StudentDashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  // UI code omitted for brevity, keep your animated background and styles

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-white">Student Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-400 bg-red-900/60 rounded p-2">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <motion.button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </form>
        <p className="mt-4 text-center text-white/90 text-sm">
          Don't have an account?{" "}
          <Link to="/StudentSignup" className="underline font-semibold hover:text-white">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
