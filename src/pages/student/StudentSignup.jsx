import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import LoginCard from "../common/LoginCard";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  class: "",
  section: "",
  rollNumber: "",
  phone: "",
};

const StudentSignup = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  const navigate = useNavigate();

  // Input validation function
  const validate = (data) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !data.name.trim() ||
      !data.email.trim() ||
      !data.password ||
      !data.class.trim() ||
      !data.section.trim() ||
      !data.rollNumber.trim() ||
      !data.phone.trim()
    ) return "Please fill all fields.";
    if (!emailRegex.test(data.email.trim())) return "Invalid email address.";
    if (!/^[A-Za-z0-9-_.]+$/.test(data.rollNumber))
      return "Roll number can include letters, numbers, - _ . only.";
    if (!/^[1-9][0-2]?$/.test(data.class)) return "Class must be 1–12.";
    if (!/^[A-Z]$/.test(data.section)) return "Section must be a single uppercase letter.";
    if (!/^\d{10}$/.test(data.phone)) return "Phone must be 10 digits.";
    if (data.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  // Validate on form data change to enable/disable submit button
  useEffect(() => {
    setError("");
    const errMsg = validate(formData);
    setIsValid(!errMsg);
  }, [formData]);

  // Clear error after 4 seconds automatically
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const errMsg = validate(formData);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid,
        name: formData.name.trim(),
        email: formData.email.trim(),
        class: formData.class.trim(),
        section: formData.section.trim(),
        rollNumber: formData.rollNumber.trim(),
        phone: formData.phone.trim(),
        role: "student",
        createdAt: serverTimestamp(),
        classSection: `${formData.class.trim()}-${formData.section.trim()}`,
      });

      navigate("/student-dashboard", { state: { user: formData } });
    } catch (err) {
      setError(err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginCard title="Student Signup ">
      <form onSubmit={handleSignup} className="flex flex-col space-y-5">
        {error && (
          <p className="text-black-600 bg-red-100 border border-red-300 rounded-md px-4 py-2 text-center text-sm font-medium text-black-550">
            {error}
          </p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="p-3 rounded-xl bg-white/90 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required
          autoComplete="name"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="p-3 rounded-xl bg-white/90 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required
          autoComplete="email"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-3 rounded-xl bg-white/90 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required
          autoComplete="new-password"
        />

        <div className="flex gap-4">
          <input
            type="text"
            name="class"
            placeholder="Class (1-12)"
            value={formData.class}
            onChange={handleChange}
            className="p-3 rounded-xl bg-white/90 placeholder-slate-400 w-1/2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          />
          <input
            type="text"
            name="section"
            placeholder="Section (A)"
            value={formData.section}
            onChange={handleChange}
            className="p-3 rounded-xl bg-white/90 placeholder-slate-400 w-1/2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <input
          type="text"
          name="rollNumber"
          placeholder="Roll Number"
          value={formData.rollNumber}
          onChange={handleChange}
          className="p-3 rounded-xl bg-white/90 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="p-3 rounded-xl bg-white/90 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required
          autoComplete="tel"
        />

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`py-3 rounded-xl text-white font-semibold transition ${
            isValid && !loading
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Signing up…" : "Sign Up"}
        </button>

        <p className="text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/student-login" className="underline font-semibold text-blue-400 hover:text-blue-500">
            Log in
          </Link>
        </p>
      </form>
    </LoginCard>
  );
};

export default StudentSignup;
