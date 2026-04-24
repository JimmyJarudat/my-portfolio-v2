import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Types ──────────────────────────────────────────────────────────────────
const FILTERS = ["ALL", "LIVE", "CLIENT", "INTERNAL", "SAAS"] as const;
type Filter = (typeof FILTERS)[number];

interface Project {
  id: number;
  index: string;
  title: string;
  subtitle: string;
  overview: string;
  tags: Filter[];
  techStack: string[];
  architecture: string;
  infrastructure: string;
  challenges: string;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  images: string[];   // ← หลายรูป
  year: number;
  status: "live" | "internal" | "client";
}

// ─── Data ────────────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: 1, index: "01",
    title: "SaaS Analytics Dashboard",
    subtitle: "Real-time event streaming",
    overview: "Real-time analytics platform สำหรับ e-commerce ติดตาม conversion, revenue และ user behavior ผ่าน event streaming pipeline ที่รองรับ 50k+ events/min",
    tags: ["LIVE", "SAAS"],
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Kafka"],
    architecture: "Microservices + Event-driven แยก ingestion, processing และ API layer",
    infrastructure: "Docker · GitHub Actions · Nginx · VPS",
    challenges: "Handle 50k+ events/min โดยไม่ให้ latency เกิน 200ms ด้วย Redis Streams + batch processing",
    liveUrl: "https://example.com", githubUrl: "https://github.com", videoUrl: "https://youtube.com",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&q=85",
    ],
    year: 2024, status: "live",
  },
  {
    id: 2, index: "02",
    title: "Inventory Management",
    subtitle: "Multi-warehouse stock control",
    overview: "ระบบจัดการสต็อกสินค้า SME รองรับหลาย warehouse พร้อม barcode scanning, auto-reorder และ real-time sync ระหว่างสาขา",
    tags: ["CLIENT"],
    techStack: ["React", "Node.js", "MySQL", "Express", "Socket.io"],
    architecture: "Monolithic REST API + WebSocket layer สำหรับ real-time stock updates",
    infrastructure: "PM2 · Nginx · DigitalOcean · GitLab CI",
    challenges: "Race condition ใน concurrent stock update แก้ด้วย optimistic locking ระดับ DB",
    githubUrl: "https://github.com",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=85",
    ],
    year: 2024, status: "client",
  },
  {
    id: 3, index: "03",
    title: "Dev Bootstrapper CLI",
    subtitle: "One-command dev setup",
    overview: "CLI tool spin up development environment พร้อม docker-compose, env setup และ seed data ด้วยคำสั่งเดียว รองรับหลาย project template",
    tags: ["INTERNAL"],
    techStack: ["Go", "Docker", "Shell Script", "YAML"],
    architecture: "Single binary CLI parse config YAML แล้ว orchestrate containers",
    infrastructure: "GitHub Actions · GitHub Packages",
    challenges: "Cross-platform compatibility ระหว่าง macOS Apple Silicon กับ Linux AMD64",
    githubUrl: "https://github.com", videoUrl: "https://youtube.com",
    images: [
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=85",
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=85",
    ],
    year: 2023, status: "internal",
  },
  {
    id: 4, index: "04",
    title: "Multi-tenant CMS",
    subtitle: "Agency-grade content management",
    overview: "CMS สำหรับ agency ดูแลหลาย client บน domain เดียว แยก content, media และ permission ต่อ tenant ด้วย row-level security",
    tags: ["LIVE", "SAAS", "CLIENT"],
    techStack: ["Next.js", "Prisma", "PostgreSQL", "S3", "Cloudflare"],
    architecture: "Row-level security + subdomain routing สำหรับ tenant isolation",
    infrastructure: "Vercel · Cloudflare R2 · Supabase · GitHub Actions",
    challenges: "Media CDN serve ไฟล์ถูก tenant ไม่ leak ข้ามกัน ใช้ signed URL + edge middleware",
    liveUrl: "https://example.com", githubUrl: "https://github.com",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85",
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&q=85",
    ],
    year: 2024, status: "live",
  },
  {
    id: 5, index: "05",
    title: "CI/CD Pipeline Template",
    subtitle: "Reusable deployment workflow",
    overview: "Reusable GitHub Actions workflow สำหรับ Node.js/Docker ครอบคลุม test, build, deploy และ rollback พร้อม Slack notification",
    tags: ["INTERNAL"],
    techStack: ["GitHub Actions", "Docker", "Shell", "YAML"],
    architecture: "Composite actions แยก reusable steps เป็น modules",
    infrastructure: "GitHub Actions · Docker Hub · Self-hosted Runner",
    challenges: "Deploy time < 3 นาที ด้วย layer caching + parallel job",
    githubUrl: "https://github.com", videoUrl: "https://youtube.com",
    images: [
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=85",
    ],
    year: 2023, status: "internal",
  },
  {
    id: 6, index: "06",
    title: "Realtime Collab Tool",
    subtitle: "Sprint planning with live sync",
    overview: "Web app สำหรับ team sprint planning ร่วมกัน รองรับ voting, timer และ sync state แบบ real-time ด้วย WebSocket",
    tags: ["LIVE", "INTERNAL"],
    techStack: ["React", "TypeScript", "WebSocket", "Node.js", "Redis"],
    architecture: "CRDT-inspired state sync ผ่าน WebSocket rooms บน Redis Pub/Sub",
    infrastructure: "Railway · Cloudflare · GitHub Actions",
    challenges: "State consistency เมื่อ user reconnect กลางคัน ใช้ snapshot + delta replay",
    liveUrl: "https://example.com", githubUrl: "https://github.com", videoUrl: "https://youtube.com",
    images: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&q=85",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=85",
    ],
    year: 2024, status: "live",
  },
];

const STATUS_COLOR = { live: "#00ff99", client: "#facc15", internal: "#60a5fa" };
const STATUS_LABEL = { live: "LIVE", client: "CLIENT", internal: "INTERNAL" };

// ─── Icons ───────────────────────────────────────────────────────────────────
const IcoGlobe  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcoGithub = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const IcoVideo  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoArrowL = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoArrowR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ─── Image Slider ─────────────────────────────────────────────────────────────
const ImageSlider = ({
  images, accent, border, isDark, onLightbox,
}: {
  images: string[]; accent: string; border: string; isDark: boolean;
  onLightbox: (idx: number) => void;
}) => {
  const [cur, setCur] = useState(0);

  // reset when images change (project switched)
  useEffect(() => { setCur(0); }, [images]);

  const prev = () => setCur((c) => (c - 1 + images.length) % images.length);
  const next = () => setCur((c) => (c + 1) % images.length);

  return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${border}`, marginBottom: 28 }}>
      {/* image */}
      <div
        style={{ position: "relative", cursor: "zoom-in", overflow: "hidden", height: 280 }}
        onClick={() => onLightbox(cur)}
      >
        <img
          key={cur}
          src={images[cur]}
          alt={`preview ${cur + 1}`}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            filter: isDark ? "brightness(0.75)" : "brightness(0.88)",
            transition: "filter 0.3s, transform 0.35s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1.03)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = isDark ? "brightness(0.75)" : "brightness(0.88)"; e.currentTarget.style.transform = "scale(1)"; }}
        />

        {/* zoom hint */}
        <div style={{
          position: "absolute", bottom: 10, right: 12,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em",
          pointerEvents: "none",
        }}>⊕ zoom</div>
      </div>

      {/* prev / next buttons — only show if >1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", border: `1px solid rgba(255,255,255,0.15)`,
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 2, transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}cc`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
          ><IcoArrowL /></button>

          <button
            onClick={next}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", border: `1px solid rgba(255,255,255,0.15)`,
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 2, transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}cc`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
          ><IcoArrowR /></button>

          {/* dots */}
          <div style={{
            position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 6, zIndex: 2,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCur(i); }}
                style={{
                  width: i === cur ? 20 : 6, height: 6,
                  borderRadius: 3, border: "none", cursor: "pointer",
                  background: i === cur ? accent : "rgba(255,255,255,0.35)",
                  transition: "all 0.2s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* counter */}
          <div style={{
            position: "absolute", top: 10, right: 12, zIndex: 2,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            color: "rgba(255,255,255,0.6)",
            background: "rgba(0,0,0,0.45)", borderRadius: 3, padding: "2px 8px",
          }}>{cur + 1} / {images.length}</div>
        </>
      )}
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({
  images, startIdx, accent, onClose,
}: {
  images: string[]; startIdx: number; accent: string; onClose: () => void;
}) => {
  const [cur, setCur] = useState(startIdx);
  const prev = () => setCur((c) => (c - 1 + images.length) % images.length);
  const next = () => setCur((c) => (c + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.94)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      <img
        src={images[cur]} alt={`preview ${cur + 1}`}
        style={{ maxWidth: "88vw", maxHeight: "86vh", borderRadius: 6, objectFit: "contain" }}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} style={lbBtn("left", accent)}><IcoArrowL /></button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} style={lbBtn("right", accent)}><IcoArrowR /></button>
          <div style={{
            position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 8,
          }}>
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCur(i); }} style={{
                width: i === cur ? 24 : 7, height: 7, borderRadius: 4,
                border: "none", cursor: "pointer", padding: 0,
                background: i === cur ? accent : "rgba(255,255,255,0.3)",
                transition: "all 0.2s",
              }} />
            ))}
          </div>
        </>
      )}

      <button onClick={onClose} style={{
        position: "absolute", top: 20, right: 24,
        width: 38, height: 38, borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.08)",
        color: "#fff", fontSize: 20, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>×</button>

      <div style={{
        position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em",
      }}>{cur + 1} / {images.length} &nbsp;·&nbsp; ESC to close</div>
    </div>
  );
};

const lbBtn = (side: "left" | "right", accent: string): React.CSSProperties => ({
  position: "absolute", [side]: 24, top: "50%", transform: "translateY(-50%)",
  width: 42, height: 42, borderRadius: "50%",
  background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", zIndex: 2,
});

// ─── Page ─────────────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const [selectedId,   setSelectedId]   = useState<number>(1);
  const [lightboxIdx,  setLightboxIdx]  = useState<number | null>(null);

  const bg      = isDark ? "#1c1c22" : "#f5f3ff";
  const bgSec   = isDark ? "#27272a" : "#ede9fe";
  const text    = isDark ? "#ffffff" : "#1e1b2e";
  const muted   = isDark ? "rgba(255,255,255,0.4)" : "#5b5478";
  const border  = isDark ? "rgba(255,255,255,0.07)" : "#c4b5fd";
  const accent  = isDark ? "#00ff99" : "#7c3aed";
  const pillBg  = isDark ? "rgba(0,255,153,0.07)"  : "rgba(124,58,237,0.07)";
  const pillBdr = isDark ? "rgba(0,255,153,0.2)"   : "rgba(124,58,237,0.2)";
  const pillTxt = isDark ? "#00ff99"               : "#7c3aed";

  const filtered = activeFilter === "ALL"
    ? PROJECTS
    : PROJECTS.filter((p) => p.tags.includes(activeFilter));

  const project = filtered.find((p) => p.id === selectedId) ?? filtered[0];

  const hoverLink = (e: React.MouseEvent<HTMLAnchorElement>, on: boolean) => {
    e.currentTarget.style.borderColor = on ? accent : border;
    e.currentTarget.style.color       = on ? accent : muted;
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${accent}35; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        a { text-decoration: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "52px 36px 80px", overflow: "hidden" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.22em", color: accent,
            textTransform: "uppercase", marginBottom: 10,
          }}>Selected Work</p>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(52px, 7vw, 90px)", fontWeight: 800,
            color: text, letterSpacing: "-0.045em", lineHeight: 0.92,
          }}>Projects<span style={{ color: accent }}>.</span></h1>
        </div>

        {/* ── Filter tabs ── */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 40,
          borderBottom: `1px solid ${border}`,
        }}>
          {FILTERS.map((f) => {
            const count = f === "ALL" ? PROJECTS.length : PROJECTS.filter(p => p.tags.includes(f)).length;
            const isAct = activeFilter === f;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "9px 20px", background: "transparent",
                borderBottom: `2px solid ${isAct ? accent : "transparent"}`,
                marginBottom: -1,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: isAct ? accent : muted,
                transition: "all 0.15s",
              }}>
                {f} <span style={{ opacity: 0.55 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── Split layout ── */}
        {filtered.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: muted }}>∅ no projects</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",   // ← left แคบลงมาก
            gap: 0, alignItems: "start", minWidth: 0,
          }}>

            {/* ══ LEFT: compact nav menu ══ */}
            <div style={{
              borderRight: `1px solid ${border}`,
              paddingRight: 0,
              maxHeight: "78vh",
              overflowY: "auto",
              position: "sticky",
              top: 24,
            }}>
              {filtered.map((p) => {
                const sel = project?.id === p.id;
                const sc  = STATUS_COLOR[p.status];
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      padding: "14px 16px 14px 0",
                      borderBottom: `1px solid ${border}`,
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.15s",
                      background: sel
                        ? isDark ? "rgba(255,255,255,0.02)" : "rgba(124,58,237,0.04)"
                        : "transparent",
                    }}
                  >
                    {/* active bar */}
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: sel ? 3 : 0,
                      background: accent,
                      transition: "width 0.2s ease",
                      borderRadius: "0 2px 2px 0",
                    }} />

                    <div style={{ paddingLeft: sel ? 14 : 0, transition: "padding 0.2s" }}>
                      {/* index + status dot */}
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                          color: sel ? accent : muted, letterSpacing: "0.1em",
                          transition: "color 0.2s",
                        }}>{p.index}</span>
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%", display: "inline-block",
                          background: sc,
                          boxShadow: sel ? `0 0 6px ${sc}` : "none",
                          transition: "box-shadow 0.2s",
                        }} />
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 8,
                          color: sc, letterSpacing: "0.1em", textTransform: "uppercase",
                          opacity: sel ? 1 : 0.6,
                        }}>{STATUS_LABEL[p.status]}</span>
                      </div>

                      {/* title — เด่น */}
                      <p style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: sel ? 15 : 13, fontWeight: 800,
                        color: sel ? text : muted,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.25,
                        transition: "all 0.2s",
                      }}>{p.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ══ RIGHT: detail panel ══ */}
            {project && (
              <div
                key={project.id}
                style={{
                  paddingLeft: 44,
                  minWidth: 0, overflow: "hidden",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
              >
                {/* image slider */}
                <ImageSlider
                  images={project.images}
                  accent={accent}
                  border={border}
                  isDark={isDark}
                  onLightbox={(idx) => setLightboxIdx(idx)}
                />

                {/* status badge + title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: STATUS_COLOR[project.status],
                    background: `${STATUS_COLOR[project.status]}15`,
                    border: `1px solid ${STATUS_COLOR[project.status]}35`,
                    borderRadius: 4, padding: "3px 10px",
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%", display: "inline-block",
                      background: STATUS_COLOR[project.status],
                      boxShadow: `0 0 6px ${STATUS_COLOR[project.status]}`,
                    }} />
                    {STATUS_LABEL[project.status]}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, color: muted,
                  }}>{project.year}</span>
                </div>

                <h2 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800,
                  color: text, letterSpacing: "-0.035em", lineHeight: 1.05,
                  marginBottom: 14,
                }}>{project.title}</h2>

                {/* overview */}
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15, color: muted, lineHeight: 1.85, marginBottom: 24,
                }}>{project.overview}</p>

                {/* tech pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 28 }}>
                  {project.techStack.map((t) => (
                    <span key={t} style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                      padding: "5px 14px", borderRadius: 4,
                      background: pillBg, border: `1px solid ${pillBdr}`, color: pillTxt,
                      letterSpacing: "0.04em",
                    }}>{t}</span>
                  ))}
                </div>

                {/* detail rows */}
                {[
                  { label: "Architecture",   val: project.architecture },
                  { label: "Infrastructure", val: project.infrastructure },
                  { label: "Challenges",     val: project.challenges },
                ].map((row) => (
                  <div key={row.label} style={{ borderTop: `1px solid ${border}`, padding: "16px 0" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: accent, display: "block", marginBottom: 8,
                    }}>{row.label}</span>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14, color: muted, lineHeight: 1.8,
                    }}>{row.val}</p>
                  </div>
                ))}

                {/* action links */}
                <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap", paddingBottom: 20 }}>
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                      letterSpacing: "0.06em", padding: "12px 24px", borderRadius: 6,
                      background: `${accent}16`, border: `1px solid ${accent}45`, color: accent,
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}28`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}16`; }}
                    ><IcoGlobe /> Live Site ↗</a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                      letterSpacing: "0.06em", padding: "12px 24px", borderRadius: 6,
                      background: "transparent", border: `1px solid ${border}`, color: muted,
                      transition: "all 0.15s",
                    }}
                      onMouseEnter={(e) => hoverLink(e, true)}
                      onMouseLeave={(e) => hoverLink(e, false)}
                    ><IcoGithub /> GitHub</a>
                  )}
                  {project.videoUrl && (
                    <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                      letterSpacing: "0.06em", padding: "12px 24px", borderRadius: 6,
                      background: "transparent", border: `1px solid ${border}`, color: muted,
                      transition: "all 0.15s",
                    }}
                      onMouseEnter={(e) => hoverLink(e, true)}
                      onMouseLeave={(e) => hoverLink(e, false)}
                    ><IcoVideo /> Demo</a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && project && (
        <Lightbox
          images={project.images}
          startIdx={lightboxIdx}
          accent={accent}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;