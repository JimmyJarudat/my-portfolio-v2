// components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const ProtectedRoute = () => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed]     = useState(false);

  useEffect(() => {
    // ตรวจ session ปัจจุบัน
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setChecking(false);
    });

    // ฟัง auth state เปลี่ยน (logout จากที่อื่น ฯลฯ)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    // ระหว่างเช็ค session แสดง blank เพื่อไม่ให้กะพริบ
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span
          className="font-mono text-[11px] tracking-widest uppercase animate-pulse"
          style={{ color: "var(--text-muted)" }}
        >
          checking session…
        </span>
      </div>
    );
  }

  return authed ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;