import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import LoginCard from "../common/LoginCard";

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    class: "",
    section: "",
    rollNumber: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        ...formData,
        role: "student",
        uid: userCredential.user.uid,
      });
      navigate("/student-dashboard", { state: { user: formData } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <LoginCard title="Student Signup 🦚">
      <form onSubmit={handleSignup} className="flex flex-col space-y-4">
        {error && <p className="text-red-200 text-center text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          className="p-3 rounded-xl bg-white/70"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded-xl bg-white/70"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded-xl bg-white/70"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Class"
            className="p-3 rounded-xl bg-white/70 w-1/2"
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Section"
            className="p-3 rounded-xl bg-white/70 w-1/2"
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            required
          />
        </div>
        <input
          type="text"
          placeholder="Roll Number"
          className="p-3 rounded-xl bg-white/70"
          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="p-3 rounded-xl bg-white/70"
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <button className="bg-[#1c7ed6] hover:bg-[#0b7285] text-white py-3 rounded-xl transition">
          Signup
        </button>
        <p className="text-white text-sm text-center">
          Already have an account?{" "}
          <Link to="/student-login" className="underline font-semibold">
            Login
          </Link>
        </p>
      </form>
    </LoginCard>
  );
};

export default StudentSignup;
