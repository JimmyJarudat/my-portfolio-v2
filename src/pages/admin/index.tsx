// pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  getOverviewStats,
  getDailyStats,
  getTopPages,
  type OverviewStats,
  type DailyStat,
  type TopPage,
} from "@/services/trackingService";

// ─── Mini bar chart (pure SVG, no lib needed) ─────────────────────────────────
const BarChart = ({ data, border }: { data: DailyStat[]; border: string }) => {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.visits), 1);
  const W = 600;
  const H = 120;
  const PAD = { top: 8, right: 0, bottom: 24, left: 28 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW = Math.max(1, chartW / data.length - 2);

  const ticks = [0, Math.round(max / 2), max];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H }}
      aria-label="Daily visits chart"
    >
      {ticks.map((t) => {
        const y = PAD.top + chartH - (t / max) * chartH;
        return (
          <g key={t}>
            <line
              x1={PAD.left} x2={W - PAD.right}
              y1={y} y2={y}
              stroke={border} strokeDasharray="3 3"
            />
            <text
              x={PAD.left - 4} y={y + 4}
              textAnchor="end" fontSize={8}
              fill="var(--text-muted)" opacity={0.5}
              fontFamily="monospace"
            >
              {t}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barH = Math.max((d.visits / max) * chartH, d.visits > 0 ? 2 : 0);
        const x = PAD.left + i * (chartW / data.length);
        const y = PAD.top + chartH - barH;
        const showLabel = i === 0 || i === data.length - 1 || i % 7 === 0;

        return (
          <g key={d.date}>
            <rect
              x={x + 1} y={y}
              width={barW} height={barH}
              rx={2}
              fill="var(--accent)"
              opacity={d.visits > 0 ? 0.7 : 0.1}
            />
            {showLabel && (
              <text
                x={x + barW / 2} y={H - 4}
                textAnchor="middle" fontSize={7}
                fill="var(--text-muted)" opacity={0.45}
                fontFamily="monospace"
              >
                {d.date.slice(5)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, border, cardBg,
}: {
  label: string; value: number; border: string; cardBg: string;
}) => (
  <div
    className="rounded-xl border p-5 flex flex-col gap-1"
    style={{ borderColor: border, background: cardBg }}
  >
    <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
      {label}
    </p>
    <p className="font-bold text-3xl tabular-nums" style={{ color: "var(--text)" }}>
      {value.toLocaleString()}
    </p>
  </div>
);

// ─── Admin Page ───────────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();

  const border = "rgba(255,255,255,0.07)";
  const cardBg = "rgba(255,255,255,0.02)";

  const [overview, setOverview]   = useState<OverviewStats | null>(null);
  const [daily, setDaily]         = useState<DailyStat[]>([]);
  const [topPages, setTopPages]   = useState<TopPage[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getOverviewStats(), getDailyStats(30), getTopPages(8)])
      .then(([ov, dy, tp]) => {
        setOverview(ov);
        setDaily(dy);
        setTopPages(tp);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full px-6 py-12" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              admin panel
            </p>
            <h1 className="font-bold text-2xl" style={{ color: "var(--text)" }}>
              Dashboard<span style={{ color: "var(--accent)" }}>.</span>
            </h1>
            <div className="w-6 h-0.5 bg-accent opacity-60 rounded mt-3" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/notes")}
              className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 rounded-lg border transition-all duration-150 hover:border-accent/50 hover:text-accent"
              style={{ borderColor: border, color: "var(--text-muted)" }}
            >
              จัดการ notes →
            </button>
            <button
              onClick={handleLogout}
              className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 rounded-lg border transition-all duration-150 hover:border-red-400/50 hover:text-red-400"
              style={{ borderColor: border, color: "var(--text-muted)" }}
            >
              logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-[12px] animate-pulse" style={{ color: "var(--text-muted)" }}>
            กำลังโหลดข้อมูล…
          </p>
        ) : (
          <>
            {/* ── Overview ── */}
            <section>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
                ภาพรวมผู้เยี่ยมชม
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="วันนี้"   value={overview?.today     ?? 0} border={border} cardBg={cardBg} />
                <StatCard label="เดือนนี้" value={overview?.thisMonth ?? 0} border={border} cardBg={cardBg} />
                <StatCard label="ปีนี้"    value={overview?.thisYear  ?? 0} border={border} cardBg={cardBg} />
                <StatCard label="ทั้งหมด" value={overview?.total     ?? 0} border={border} cardBg={cardBg} />
              </div>
            </section>

            {/* ── Daily chart ── */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <p className="font-mono text-[10px] tracking-widest uppercase whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  visits รายวัน — 30 วันล่าสุด
                </p>
                <div className="flex-1 h-px" style={{ background: border }} />
              </div>
              <div className="rounded-xl border p-5" style={{ borderColor: border, background: cardBg }}>
                <BarChart data={daily} border={border} />
              </div>
            </section>

            {/* ── Top pages ── */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <p className="font-mono text-[10px] tracking-widest uppercase whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  หน้าที่ถูกเปิดมากสุด
                </p>
                <div className="flex-1 h-px" style={{ background: border }} />
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: border }}>
                {topPages.length === 0 ? (
                  <p className="font-mono text-[12px] p-5" style={{ color: "var(--text-muted)" }}>
                    ยังไม่มีข้อมูล
                  </p>
                ) : (
                  topPages.map((p, i) => {
                    const pct = Math.round((p.visits / topPages[0].visits) * 100);
                    return (
                      <div
                        key={p.path}
                        className="flex items-center gap-4 px-5 py-3 relative"
                        style={{ borderBottom: i < topPages.length - 1 ? `1px solid ${border}` : "none" }}
                      >
                        <div
                          className="absolute inset-y-0 left-0"
                          style={{ width: `${pct}%`, background: "rgba(99,219,188,0.04)" }}
                        />
                        <span className="font-mono text-[10px] tabular-nums w-4 text-right shrink-0 relative z-10" style={{ color: "var(--accent)", opacity: 0.5 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-[12px] flex-1 truncate relative z-10" style={{ color: "var(--text)" }}>
                          {p.path}
                        </span>
                        <span className="font-mono text-[12px] tabular-nums shrink-0 relative z-10" style={{ color: "var(--accent)" }}>
                          {p.visits.toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;