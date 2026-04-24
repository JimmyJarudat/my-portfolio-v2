import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Types ─────────────────────────────────────────────────────────────────
const FILTERS = ["All", "Live", "Client", "Internal", "SaaS"] as const;
type Filter = (typeof FILTERS)[number];

interface Project {
  id: number;
  title: string;
  overview: string;
  tags: Filter[];
  techStack: string[];
  architecture: string;
  infrastructure: string;
  challenges: string;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  previewImage?: string;
  year: number;
  status: "live" | "internal" | "client";
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "SaaS Analytics Dashboard",
    overview:
      "Real-time analytics platform สำหรับ e-commerce ติดตาม conversion, revenue และ user behavior ผ่าน event streaming",
    tags: ["Live", "SaaS"],
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Kafka"],
    architecture: "Microservices + Event-driven แยก ingestion, processing และ API layer",
    infrastructure: "Docker · GitHub Actions · Nginx · VPS",
    challenges: "Handle 50k+ events/min โดยไม่ให้ latency เกิน 200ms ด้วย Redis Streams + batch processing",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    videoUrl: "https://youtube.com",
    previewImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    year: 2024,
    status: "live",
  },
  {
    id: 2,
    title: "Inventory Management System",
    overview: "ระบบจัดการสต็อกสินค้า SME รองรับหลาย warehouse พร้อม barcode scanning และ auto-reorder",
    tags: ["Client"],
    techStack: ["React", "Node.js", "MySQL", "Express", "Socket.io"],
    architecture: "Monolithic REST API + WebSocket layer สำหรับ real-time stock updates",
    infrastructure: "PM2 · Nginx · DigitalOcean · GitLab CI",
    challenges: "Race condition ใน concurrent stock update แก้ด้วย optimistic locking ระดับ DB",
    githubUrl: "https://github.com",
    previewImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    year: 2024,
    status: "client",
  },
  {
    id: 3,
    title: "Dev Environment Bootstrapper",
    overview: "CLI tool spin up dev environment พร้อม docker-compose, env setup และ seed data ด้วยคำสั่งเดียว",
    tags: ["Internal"],
    techStack: ["Go", "Docker", "Shell Script", "YAML"],
    architecture: "Single binary CLI parse config YAML แล้ว orchestrate containers",
    infrastructure: "GitHub Actions · GitHub Packages",
    challenges: "Cross-platform compatibility ระหว่าง macOS Apple Silicon กับ Linux AMD64",
    githubUrl: "https://github.com",
    videoUrl: "https://youtube.com",
    previewImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
    year: 2023,
    status: "internal",
  },
  {
    id: 4,
    title: "Multi-tenant CMS Platform",
    overview: "CMS สำหรับ agency ดูแลหลาย client บน domain เดียว แยก content, media และ permission ต่อ tenant",
    tags: ["Live", "SaaS", "Client"],
    techStack: ["Next.js", "Prisma", "PostgreSQL", "S3", "Cloudflare"],
    architecture: "Row-level security + subdomain routing สำหรับ tenant isolation",
    infrastructure: "Vercel · Cloudflare R2 · Supabase · GitHub Actions",
    challenges: "Media CDN serve ไฟล์ถูก tenant ไม่ leak ข้ามกัน ใช้ signed URL + edge middleware",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    year: 2024,
    status: "live",
  },
  {
    id: 5,
    title: "CI/CD Pipeline Template",
    overview: "Reusable GitHub Actions workflow สำหรับ Node.js/Docker ครอบคลุม test, build, deploy และ rollback",
    tags: ["Internal"],
    techStack: ["GitHub Actions", "Docker", "Shell", "YAML"],
    architecture: "Composite actions แยก reusable steps เป็น modules",
    infrastructure: "GitHub Actions · Docker Hub · Self-hosted Runner",
    challenges: "Deploy time < 3 นาที ด้วย layer caching + parallel job",
    githubUrl: "https://github.com",
    videoUrl: "https://youtube.com",
    previewImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80",
    year: 2023,
    status: "internal",
  },
  {
    id: 6,
    title: "Real-time Collaboration Tool",
    overview: "Web app สำหรับ sprint planning ร่วมกัน รองรับ voting, timer และ sync state แบบ real-time",
    tags: ["Live", "Internal"],
    techStack: ["React", "TypeScript", "WebSocket", "Node.js", "Redis"],
    architecture: "CRDT-inspired state sync ผ่าน WebSocket rooms บน Redis Pub/Sub",
    infrastructure: "Railway · Cloudflare · GitHub Actions",
    challenges: "State consistency เมื่อ user reconnect กลางคัน ใช้ snapshot + delta replay",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    videoUrl: "https://youtube.com",
    previewImage: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80",
    year: 2024,
    status: "live",
  },
];

// ─── Status config ─────────────────────────────────────────────────────────
const statusMeta = {
  live:     { label: "LIVE",     color: "#00ff99" },
  client:   { label: "CLIENT",   color: "#facc15" },
  internal: { label: "INTERNAL", color: "#60a5fa" },
};

// ─── SVG Icons ──────────────────────────────────────────────────────────────
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const GithubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const VideoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const ImageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.25s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ─── Theme tokens ───────────────────────────────────────────────────────────
const getTheme = (dark: boolean) => ({
  bg:        dark ? "#1c1c22" : "#f5f3ff",
  bgSec:     dark ? "#27272a" : "#ede9fe",
  text:      dark ? "#ffffff" : "#1e1b2e",
  muted:     dark ? "rgba(255,255,255,0.5)" : "#5b5478",
  border:    dark ? "rgba(255,255,255,0.08)" : "#c4b5fd",
  accent:    dark ? "#00ff99" : "#7c3aed",
  accentHov: dark ? "#00e187" : "#6d28d9",
  pillBg:    dark ? "rgba(0,255,153,0.08)"   : "rgba(124,58,237,0.08)",
  pillBdr:   dark ? "rgba(0,255,153,0.25)"   : "rgba(124,58,237,0.25)",
  pillTxt:   dark ? "#00ff99"                : "#7c3aed",
});

// ─── Project Card ───────────────────────────────────────────────────────────
const ProjectCard = ({
  project, isExpanded, onToggle, dark,
}: {
  project: Project; isExpanded: boolean; onToggle: () => void; dark: boolean;
}) => {
  const [lightbox, setLightbox] = useState(false);
  const t = getTheme(dark);
  const meta = statusMeta[project.status];

  return (
    <>
      <div style={{
        background: isExpanded ? t.bgSec : t.bg,
        border: `1px solid ${isExpanded ? t.accent : t.border}`,
        borderRadius: 8, overflow: "hidden",
        transition: "all 0.25s ease",
        boxShadow: isExpanded ? `0 0 24px ${t.accent}14` : "none",
      }}>

        {/* ── Header (clickable) ── */}
        <div onClick={onToggle} style={{ padding: "20px 22px 16px", cursor: "pointer", userSelect: "none" }}>

          {/* Row 1: status badge + year + chevron */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.14em",
                color: meta.color, background: `${meta.color}15`,
                border: `1px solid ${meta.color}35`, borderRadius: 3, padding: "2px 8px",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color,
                  boxShadow: `0 0 5px ${meta.color}`, display: "inline-block" }} />
                {meta.label}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.muted }}>
                {project.year}
              </span>
            </div>
            <span style={{ color: t.muted }}><ChevronIcon open={isExpanded} /></span>
          </div>

          {/* Title */}
          <h3 style={{
            margin: "0 0 8px", fontSize: 17,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            color: t.text, letterSpacing: "-0.02em",
          }}>
            {project.title}
          </h3>

          {/* Overview */}
          <p style={{
            margin: "0 0 16px", fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: t.muted, lineHeight: 1.75,
          }}>
            {project.overview}
          </p>

          {/* Row 2: tags + action links */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {project.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em",
                  padding: "2px 8px", borderRadius: 3,
                  border: `1px solid ${t.border}`, color: t.muted, textTransform: "uppercase",
                }}>{tag}</span>
              ))}
            </div>

            {/* Action buttons */}
            <div onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
              {project.previewImage && (
                <ActionBtn onClick={() => setLightbox(true)} accent={t.accent} muted={t.muted} border={t.border}>
                  <ImageIcon /><span>Preview</span>
                </ActionBtn>
              )}
              {project.videoUrl && (
                <ActionLink href={project.videoUrl} accent={t.accent} muted={t.muted} border={t.border}>
                  <VideoIcon /><span>Demo</span>
                </ActionLink>
              )}
              {project.githubUrl && (
                <ActionLink href={project.githubUrl} accent={t.accent} muted={t.muted} border={t.border}>
                  <GithubIcon /><span>GitHub</span>
                </ActionLink>
              )}
              {project.liveUrl && (
                <ActionLink href={project.liveUrl} accent={t.accent} muted={t.muted} border={t.border} highlight>
                  <GlobeIcon /><span>Live ↗</span>
                </ActionLink>
              )}
            </div>
          </div>
        </div>

        {/* ── Expanded content ── */}
        {isExpanded && (
          <div style={{ borderTop: `1px solid ${t.border}`, padding: "20px 22px 24px" }}>

            {/* Thumbnail */}
            {project.previewImage && (
              <div
                onClick={() => setLightbox(true)}
                style={{
                  marginBottom: 22, borderRadius: 6, overflow: "hidden",
                  border: `1px solid ${t.border}`, cursor: "zoom-in",
                  position: "relative",
                }}
              >
                <img
                  src={project.previewImage}
                  alt={project.title}
                  style={{ width: "100%", height: 200, objectFit: "cover", display: "block",
                    filter: dark ? "brightness(0.7)" : "brightness(0.88)", transition: "filter 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = dark ? "brightness(0.7)" : "brightness(0.88)")}
                />
                <div style={{
                  position: "absolute", bottom: 10, right: 10,
                  background: "rgba(0,0,0,0.55)", borderRadius: 4,
                  padding: "3px 10px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                  color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em",
                }}>click to expand</div>
              </div>
            )}

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 32px" }}>
              <div>
                <SLabel color={t.accent}>Tech Stack</SLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {project.techStack.map((name) => (
                    <span key={name} style={{
                      fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 10px", borderRadius: 3,
                      background: t.pillBg, border: `1px solid ${t.pillBdr}`, color: t.pillTxt,
                    }}>{name}</span>
                  ))}
                </div>
              </div>

              <div>
                <SLabel color={t.accent}>Infrastructure</SLabel>
                <p style={dtxt(t.muted)}>{project.infrastructure}</p>
              </div>

              <div>
                <SLabel color={t.accent}>Architecture</SLabel>
                <p style={dtxt(t.muted)}>{project.architecture}</p>
              </div>

              <div>
                <SLabel color={t.accent}>Challenges</SLabel>
                <p style={{ ...dtxt(t.muted), borderLeft: `2px solid ${t.accent}40`, paddingLeft: 10 }}>
                  {project.challenges}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && project.previewImage && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img
            src={project.previewImage}
            alt={project.title}
            style={{
              maxWidth: "90vw", maxHeight: "88vh",
              borderRadius: 8, objectFit: "contain",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}
          />
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 36, height: 36, borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace",
            }}
          >×</button>
        </div>
      )}
    </>
  );
};

// ─── Tiny shared components ─────────────────────────────────────────────────
const SLabel = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span style={{
    fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.14em", textTransform: "uppercase", color,
  }}>{children}</span>
);

const dtxt = (color: string): React.CSSProperties => ({
  margin: "10px 0 0", fontSize: 12,
  fontFamily: "'JetBrains Mono', monospace",
  color, lineHeight: 1.8,
});

const baseBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "0.06em", padding: "5px 12px", borderRadius: 5,
  cursor: "pointer", transition: "all 0.15s ease",
  textDecoration: "none",
};

const ActionBtn = ({ children, onClick, accent, muted, border }: {
  children: React.ReactNode; onClick: () => void;
  accent: string; muted: string; border: string;
}) => (
  <button onClick={onClick} style={{
    ...baseBtnStyle,
    background: "transparent",
    border: `1px solid ${border}`,
    color: muted,
  }}>{children}</button>
);

const ActionLink = ({ children, href, accent, muted, border, highlight }: {
  children: React.ReactNode; href: string;
  accent: string; muted: string; border: string; highlight?: boolean;
}) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{
    ...baseBtnStyle,
    background: highlight ? `${accent}18` : "transparent",
    border: `1px solid ${highlight ? `${accent}45` : border}`,
    color: highlight ? accent : muted,
  }}>{children}</a>
);

// ─── Page ───────────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const t = getTheme(dark);

  const filtered =
    activeFilter === "All"
      ? MOCK_PROJECTS
      : MOCK_PROJECTS.filter((p) => p.tags.includes(activeFilter));

  return (
    <div style={{ minHeight: "100vh", background: t.bg, transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; }
        button { font-family: inherit; }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "64px 24px 100px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 52 }}>
          <div>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: "0.18em", color: t.accent,
              textTransform: "uppercase", marginBottom: 10,
            }}>./projects</p>
            <h1 style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(34px, 5.5vw, 54px)", fontWeight: 800,
              color: t.text, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 12,
            }}>Projects</h1>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, color: t.muted, lineHeight: 1.7,
            }}>
              งานที่ส่งมอบจริง — code · architecture · infrastructure
            </p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{
          display: "flex", gap: 3, marginBottom: 24,
          padding: 4, background: t.bgSec,
          border: `1px solid ${t.border}`, borderRadius: 8,
          width: "fit-content",
        }}>
          {FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <button key={f}
                onClick={() => { setActiveFilter(f); setExpandedId(null); }}
                style={{
                  padding: "6px 16px", borderRadius: 5, border: "none",
                  cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  transition: "all 0.15s",
                  background: active ? `${t.accent}1a` : "transparent",
                  color: active ? t.accent : t.muted,
                  outline: active ? `1px solid ${t.accent}45` : "none",
                }}
              >{f}</button>
            );
          })}
        </div>

        {/* Count */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: t.muted, letterSpacing: "0.06em", marginBottom: 16,
        }}>
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* ── List ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isExpanded={expandedId === project.id}
              onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
              dark={dark}
            />
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, color: t.muted, marginBottom: 10 }}>∅</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: t.muted, letterSpacing: "0.08em" }}>
              no projects in this filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;