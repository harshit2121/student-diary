import React from "react";

const LoginCard = ({ title, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b7285] to-[#1c7ed6] font-[Poppins]">
    <div className="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-[380px] border border-white/30">
      <h2 className="text-3xl font-bold text-white text-center mb-8 drop-shadow-md">{title}</h2>
      {children}
    </div>
  </div>
);

export default LoginCard;
