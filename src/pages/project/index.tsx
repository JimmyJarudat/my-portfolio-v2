import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Globe, Github, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { PROJECTS } from "./data/project.data";
import { ImageSlider } from "./components/ImageSlider";
import { Lightbox } from "./components/Lightbox";

const FILTERS = ["ALL", "LIVE", "CLIENT", "INTERNAL", "SAAS"] as const;
type Filter = (typeof FILTERS)[number];



// ─── Projects Page ────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // ① filtered ต้องมาก่อน
  const filtered = activeFilter === "ALL"
    ? PROJECTS
    : PROJECTS.filter((p) => p.tags.includes(activeFilter));

  // ② แล้วค่อย selectedId
  const tabParam = searchParams.get("tab");
  const selectedId = (() => {
    if (!tabParam) return PROJECTS[0].id;
    const match = PROJECTS.find((p) => p.title.replace(/\s+/g, "-") === tabParam);
    return match?.id ?? PROJECTS[0].id;
  })();

  // ③ แล้วค่อย project
  const project = filtered.find((p) => p.id === selectedId) ?? filtered[0];

  // ④ useEffect
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((p) => p.id === selectedId)) {
      const slug = filtered[0].title.replace(/\s+/g, "-");
      navigate(`/project?tab=${slug}`);
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
                    onClick={() => {
                      const slug = p.title.replace(/\s+/g, "-");
                      navigate(`/project?tab=${slug}`);
                    }}
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
                      <Globe /> Live Site ↗
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
                      <Github size={14} /> GitHub
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
                      <Video size={14} /> Demo
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




const STATUS_DOT = {
  live: "bg-violet-500",
  client: "bg-sky-500",
  internal: "bg-slate-500",
};

const STATUS_TEXT = {
  live: "text-violet-600",
  client: "text-sky-600",
  internal: "text-slate-600",
};

const STATUS_BORDER = {
  live: "border-violet-400/30",
  client: "border-sky-400/30",
  internal: "border-slate-400/30",
};

const STATUS_BG = {
  live: "bg-violet-500/15",
  client: "bg-sky-500/15",
  internal: "bg-slate-500/15",
};

const STATUS_LABEL = {
  live: "LIVE",
  client: "CLIENT",
  internal: "INTERNAL",
};