import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type Field = "email" | "password";
type Status = "idle" | "loading" | "error";

// ─── Admin Login Page ─────────────────────────────────────────────────────────
const AdminLoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [focused, setFocused]   = useState<Field | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : error.message
      );
      return;
    }

    setStatus("idle");
    navigate("/admin");
  };

  const inputBase =
    "w-full bg-transparent font-mono text-[13px] outline-none transition-colors duration-150 py-2.5 px-3 rounded-lg border";

  const inputStyle = (field: Field) => ({
    borderColor:
      status === "error"
        ? "rgba(248,113,113,0.5)"
        : focused === field
        ? "var(--accent)"
        : "rgba(255,255,255,0.09)",
    color: "var(--text)",
    background:
      focused === field
        ? "rgba(99,219,188,0.03)"
        : "rgba(255,255,255,0.02)",
  });

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Card ── */}
      <div className="w-full max-w-sm">

        {/* Logo / title */}
        <div className="mb-10">
          <p
            className="font-mono text-[10px] tracking-[0.25em] uppercase mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            restricted area
          </p>
          <h1
            className="font-bold text-2xl leading-tight"
            style={{ color: "var(--text)" }}
          >
            Admin<span style={{ color: "var(--accent)" }}>.</span>
          </h1>
          <div className="w-6 h-0.5 bg-accent opacity-60 rounded mt-3" />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Email */}
          <div>
            <label
              className="font-mono text-[10px] tracking-widest uppercase block mb-1.5 transition-colors"
              style={{ color: focused === "email" ? "var(--accent)" : "var(--text-muted)" }}
            >
              email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              className={`${inputBase} placeholder:opacity-25`}
              style={inputStyle("email")}
              disabled={status === "loading"}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="font-mono text-[10px] tracking-widest uppercase block mb-1.5 transition-colors"
              style={{ color: focused === "password" ? "var(--accent)" : "var(--text-muted)" }}
            >
              password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                className={`${inputBase} placeholder:opacity-25 pr-10`}
                style={inputStyle("password")}
                disabled={status === "loading"}
              />
              {/* Toggle show/hide */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-widest uppercase transition-colors hover:text-accent select-none"
                style={{ color: "var(--text-muted)" }}
              >
                {showPw ? "hide" : "show"}
              </button>
            </div>
          </div>

          {/* Error message */}
          {status === "error" && (
            <p
              className="font-mono text-[11px] leading-relaxed"
              style={{ color: "rgba(248,113,113,0.9)" }}
            >
              ✕ {errorMsg}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading" || !email || !password}
            className="w-full font-mono text-[12px] tracking-widest uppercase py-2.5 rounded-lg border transition-all duration-150 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: "var(--accent)",
              color: status === "loading" ? "var(--text-muted)" : "var(--accent)",
              background:
                status === "loading"
                  ? "rgba(99,219,188,0.04)"
                  : "rgba(99,219,188,0.06)",
            }}
          >
            {status === "loading" ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-pulse">●</span> กำลังเข้าสู่ระบบ…
              </span>
            ) : (
              "เข้าสู่ระบบ →"
            )}
          </button>
        </form>

        {/* Footer hint */}
        <p
          className="font-mono text-[10px] text-center mt-8 tracking-wide"
          style={{ color: "var(--text-muted)", opacity: 0.4 }}
        >
          สำหรับผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;