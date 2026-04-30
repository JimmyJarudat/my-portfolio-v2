import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Types ───────────────────────────────────────────────────────────────────
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
  images: string[];
  year: number;
  status: "live" | "internal" | "client";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: 1, index: "01",
    title: "Nova Platform",
    subtitle: "File & Warehouse Management System",
    overview: "ระบบบริหารจัดการไฟล์และโกดังแบบครบวงจรสำหรับใช้งานภายในองค์กร พัฒนาด้วย React + TypeScript ฝั่ง Frontend และ Elysia.js + Prisma ORM ฝั่ง Backend เชื่อมต่อฐานข้อมูลคู่ขนาน MariaDB และ SQL Server ผ่าน dual Prisma client พร้อมระบบ Debezium CDC sync ข้อมูลสองทิศทางแบบ real-time รองรับการแสดงผลโกดังในรูปแบบ 3D Visualization ด้วย React Three Fiber คำนวณพื้นที่จัดเก็บและแนะนำตำแหน่งวางกล่องเอกสารอัตโนมัติผ่าน suggestSpace algorithm นอกจากนี้ยังมีระบบ IT Job Management เชื่อมต่อ Nextcloud WebDAV สำหรับจัดการไฟล์งาน และระบบ Auth ที่รองรับ httpOnly cookie session, bcrypt, 2FA และ account lockout ทั้งหมด deploy บน Docker Swarm ผ่าน Nginx Proxy Manager",
    tags: ["INTERNAL"],
    techStack: ["React", "TypeScript", "Elysia.js", "Prisma", "SQL Server", "MariaDB", "Docker"],
    architecture: "Monorepo full-stack — Elysia.js REST API + dual Prisma client แยก MariaDB/SQL Server พร้อม Debezium CDC sync สองทิศทาง",
    infrastructure: "Docker Swarm · Nginx Proxy Manager · Self-hosted · GitLab CI",
    challenges: "Sync ข้อมูลสองทาง MariaDB↔SQL Server แบบ real-time ด้วย Debezium CDC รองรับ Thai encoding (windows-874→UTF-8), deadlock handling และ IDENTITY_INSERT",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=85",
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=85",
    ],
    year: 2025, status: "internal",
  },
  {
    id: 2, index: "02",
    title: "Jupiter IPTV",
    subtitle: "Android TV Box Management Platform",
    overview: "ระบบบริหารจัดการผู้ใช้งานและอุปกรณ์ Android TV Box แบบครบวงจร ทำหน้าที่เป็น API หลักที่ทีมพัฒนา Hardware ฝั่งไต้หวัน call เข้ามาเพื่อ activate device, sync สถานะอุปกรณ์ และจัดการ subscription lifecycle ครอบคลุมตั้งแต่การ activate, suspend, cancel ทั้งแบบ immediate และ expire รองรับระบบ Reseller และตัวแทนจำหน่าย, จัดการ Package และ Plan, ชำระเงินผ่าน QR Code ที่เชื่อมต่อกับ Internal Payment Gateway ของทีม ตรวจสอบสถานะผ่าน webhook พร้อม duplicate protection และ signature verification, ออก invoice และ billing อัตโนมัติ พร้อม Report และ Dashboard สำหรับทีม Back Office และ Call Center ควบคุมสิทธิ์ผ่าน permission matrix ครอบคลุม 16 roles",
    tags: ["CLIENT"],
    techStack: ["NestJS", "React", "TypeScript", "PostgreSQL", "Internal Payment Gateway"],
    architecture: "REST API กลางรองรับ Taiwan hardware team call เข้า + internal GUI — แยก module ชัดเจนครอบคลุม device management, subscription lifecycle, reseller system, payment webhook และ billing",
    infrastructure: "Docker · Nginx · Self-hosted",
    challenges: "ออกแบบ API contract ให้ Taiwan call ได้ถูกต้องทุก flow, จัดการ webhook จาก internal payment gateway ให้รองรับ duplicate protection, verify signature และ background process อย่างปลอดภัย รวมถึง permission matrix 16 roles ให้ครอบคลุมทุก workflow ของ Call Center และ Reseller",
    images: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&q=85",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=85",
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

const STATUS_DOT: Record<string, string> = {
  live: "bg-emerald-400",
  client: "bg-yellow-400",
  internal: "bg-blue-400",
};
const STATUS_TEXT: Record<string, string> = {
  live: "text-emerald-400",
  client: "text-yellow-400",
  internal: "text-blue-400",
};
const STATUS_BORDER: Record<string, string> = {
  live: "border-emerald-400/30",
  client: "border-yellow-400/30",
  internal: "border-blue-400/30",
};
const STATUS_BG: Record<string, string> = {
  live: "bg-emerald-400/10",
  client: "bg-yellow-400/10",
  internal: "bg-blue-400/10",
};
const STATUS_LABEL: Record<string, string> = {
  live: "LIVE", client: "CLIENT", internal: "INTERNAL",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcoGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IcoGithub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const IcoVideo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
const IcoChevL = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IcoChevR = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Image Slider ─────────────────────────────────────────────────────────────
const ImageSlider = ({
  images,
  onLightbox,
}: {
  images: string[];
  onLightbox: (idx: number) => void;
}) => {
  const [cur, setCur] = useState(0);

  useEffect(() => { setCur(0); }, [images]);

  const prev = () => setCur((c) => (c - 1 + images.length) % images.length);
  const next = () => setCur((c) => (c + 1) % images.length);

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 mb-7 group">
      {/* Image */}
      <div
        className="relative h-[260px] overflow-hidden cursor-zoom-in"
        onClick={() => onLightbox(cur)}
      >
        <img
          key={cur}
          src={images[cur]}
          alt={`preview ${cur + 1}`}
          className="w-full h-full object-cover brightness-75 group-hover:brightness-90 scale-100 group-hover:scale-105 transition-all duration-500"
        />
        <span className="absolute bottom-2 right-3 text-[9px] tracking-widest text-white/40 pointer-events-none select-none">
          ⊕ zoom
        </span>
      </div>

      {/* Controls */}
      {images.length > 1 && (
        <>
          {/* Counter */}
          <span className="absolute top-2 right-3 text-[9px] font-mono tracking-widest text-white/50 bg-black/50 rounded px-2 py-0.5 z-10">
            {cur + 1} / {images.length}
          </span>

          {/* Prev */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
          >
            <IcoChevL />
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
          >
            <IcoChevR />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCur(i); }}
                className={`h-1.5 rounded-full transition-all duration-200 border-none cursor-pointer
                  ${i === cur ? "w-5 bg-accent" : "w-1.5 bg-white/35"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({
  images,
  startIdx,
  onClose,
}: {
  images: string[];
  startIdx: number;
  onClose: () => void;
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
  }, [cur]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/94 flex items-center justify-center cursor-zoom-out"
      onClick={onClose}
    >
      <img
        src={images[cur]}
        alt={`preview ${cur + 1}`}
        className="max-w-[88vw] max-h-[86vh] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 w-9 h-9 rounded-lg border border-white/15 bg-white/8 text-white text-xl flex items-center justify-center hover:bg-white/15 transition-colors"
      >
        ×
      </button>

      {/* Counter */}
      <span className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest text-white/40">
        {cur + 1} / {images.length} · ESC to close
      </span>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:border-accent transition-colors z-10"
          >
            <IcoChevL />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:border-accent transition-colors z-10"
          >
            <IcoChevR />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCur(i); }}
                className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-200
                  ${i === cur ? "w-6 bg-accent" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Projects Page ────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = activeFilter === "ALL"
    ? PROJECTS
    : PROJECTS.filter((p) => p.tags.includes(activeFilter));

  const project = filtered.find((p) => p.id === selectedId) ?? filtered[0];

  // auto-select first when filter changes
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [activeFilter]);

  return (
    <section className="min-h-full w-full">
      <div className="container mx-auto px-4 xl:px-0 py-12 xl:py-16">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-accent text-[10px] font-mono tracking-[0.22em] uppercase mb-2">
            What I've Shipped
          </p>
          <h1 className="h1" style={{ color: "var(--text)" }}>
            Builds.<span className="text-accent">.</span>
          </h1>
        </div>

        {/* ── Filter tabs ── */}
        <div
          className="flex gap-0 mb-10 border-b"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }}
        >
          {FILTERS.map((f) => {
            const count = f === "ALL"
              ? PROJECTS.length
              : PROJECTS.filter((p) => p.tags.includes(f)).length;
            const isAct = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`font-mono text-[10px] tracking-[0.14em] uppercase px-4 py-2.5 -mb-px border-b-2 transition-all duration-150
                  ${isAct
                    ? "border-accent text-accent"
                    : "border-transparent hover:text-accent/70"
                  }`}
                style={{ color: isAct ? "var(--accent)" : "var(--text-muted)" }}
              >
                {f} <span className="opacity-50">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── Split layout ── */}
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
              ∅ no projects
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-0">

            {/* ══ LEFT: nav list ══ */}
            <div
              className="border-r xl:sticky xl:top-20 xl:self-start"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
            >
              {filtered.map((p) => {
                const sel = project?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`relative pr-4 py-4 border-b cursor-pointer transition-colors duration-150
                      ${sel
                        ? isDark ? "bg-white/[0.02]" : "bg-accent/[0.04]"
                        : "hover:bg-white/[0.01]"
                      }`}
                    style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }}
                  >
                    {/* active bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 rounded-r-sm bg-accent transition-all duration-200
                        ${sel ? "w-0.5" : "w-0"}`}
                    />

                    <div className={`transition-all duration-200 ${sel ? "pl-3.5" : "pl-0"}`}>
                      {/* index + status */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="font-mono text-[9px] tracking-widest transition-colors duration-200"
                          style={{ color: sel ? "var(--accent)" : "var(--text-muted)" }}
                        >
                          {p.index}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status]} ${sel ? "shadow-[0_0_6px_currentColor]" : ""}`} />
                        <span className={`font-mono text-[8px] tracking-widest uppercase ${STATUS_TEXT[p.status]} ${sel ? "opacity-100" : "opacity-60"}`}>
                          {STATUS_LABEL[p.status]}
                        </span>
                      </div>

                      {/* title */}
                      <p
                        className={`font-bold leading-tight transition-all duration-200
                          ${sel ? "text-[15px]" : "text-[13px]"}`}
                        style={{ color: sel ? "var(--text)" : "var(--text-muted)" }}
                      >
                        {p.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ══ RIGHT: detail ══ */}
            {project && (
              <div
                key={project.id}
                className="xl:pl-11 mt-6 xl:mt-0"
              >
                {/* Image slider */}
                <ImageSlider
                  images={project.images}
                  onLightbox={(idx) => setLightboxIdx(idx)}
                />

                {/* Status badge + year */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase
                      px-2.5 py-1 rounded border
                      ${STATUS_TEXT[project.status]} ${STATUS_BG[project.status]} ${STATUS_BORDER[project.status]}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[project.status]}`} />
                    {STATUS_LABEL[project.status]}
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {project.year}
                  </span>
                </div>

                {/* Title */}
                <h2 className="h2 mb-4" style={{ color: "var(--text)" }}>
                  {project.title}
                </h2>

                {/* Overview */}
                <p className="font-mono text-[14px] leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                  {project.overview}
                </p>

                {/* Tech pills */}
                <div className="flex flex-wrap gap-2 mb-7">
                  {project.techStack.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] tracking-wide px-3 py-1 rounded border text-accent"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Detail rows */}
                {[
                  { label: "Architecture", val: project.architecture },
                  { label: "Infrastructure", val: project.infrastructure },
                  { label: "Challenges", val: project.challenges },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="border-t py-4"
                    style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
                  >
                    <span className="block font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-2">
                      {row.label}
                    </span>
                    <p className="font-mono text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {row.val}
                    </p>
                  </div>
                ))}

                {/* Action links */}
                <div className="flex flex-wrap gap-3 mt-7 pb-6">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-[12px] tracking-wide px-5 py-3 rounded-lg border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    >
                      <IcoGlobe /> Live Site ↗
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-[12px] tracking-wide px-5 py-3 rounded-lg border transition-colors hover:border-accent hover:text-accent"
                      style={{
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <IcoGithub /> GitHub
                    </a>
                  )}
                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-[12px] tracking-wide px-5 py-3 rounded-lg border transition-colors hover:border-accent hover:text-accent"
                      style={{
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <IcoVideo /> Demo
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && project && (
        <Lightbox
          images={project.images}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </section>
  );
};

export default ProjectsPage;