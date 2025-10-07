import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { setOk(false); setChecking(false); return; }
      try {
        const token = await u.getIdTokenResult(true);
        if (token?.claims?.role === "admin") {
          setOk(true);
        } else {
          const snap = await getDoc(doc(db, "users", u.uid));
          setOk(snap.exists() && snap.data().role === "admin");
        }
      } finally {
        setChecking(false);
      }
    });
    return () => unsub && unsub();
  }, []);

  if (checking) return <div className="min-h-screen grid place-items-center text-white">Checking access…</div>;
  if (!ok) return <Navigate to="/admin-login" replace />;
  return children;
}
