import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Static data (language-independent) ──────────────────────────────────────
const EXPERIENCE_META = [
  { company: "Professional Filing Service Co., Ltd.", period: "Jan 2025 — Feb 2026", tags: ["Full-stack Dev", "DevOps", "Infrastructure"] },
  { company: "Supornchai Company Limited",            period: "Aug — Dec 2024",       tags: ["Support", "Network", "Infrastructure"] },
  { company: "Chonburi Technical College",            period: "May 2023 — May 2024",  tags: ["Teaching", "Microcontrollers", "Mobile Dev"] },
];

const EDUCATION_META = [
  { name: "King Mongkut's Institute of Technology Ladkrabang",                      major: "Computer Engineering", gpa: "2.76", year: "2022", logo: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/kmitl.png" },
  { name: "Sri Songkhram Industrial Technology College, Nakhon Phanom University",  major: "Electronics",          gpa: "3.55", year: "2017", logo: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/Na.png" },
];

const SKILL_ITEMS = [
  ["React", "React Native", "Next.js", "Vite", "Tailwind CSS"],
  ["Node.js", "NestJS", "Elysia.js", "REST API"],
  ["SQL Server", "MariaDB", "MongoDB", "Firebase"],
  ["Docker", "CI/CD", "Ubuntu", "Windows Server"],
  ["MikroTik", "Firewall", "NAT", "VPN"],
  ["JavaScript", "TypeScript", "C#", "HTML/CSS"],
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcoDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);


// ─── Resume Page ──────────────────────────────────────────────────────────────
const ResumePage = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const r = t.resume;
  const isDark = theme === "dark";

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const mutedBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  return (
    <section className="min-h-full w-full">
      <div className="container mx-auto px-4 xl:px-0 py-12 xl:py-16">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-accent text-[10px] font-mono tracking-[0.22em] uppercase mb-2">
              {r.eyebrow}
            </p>
            <h1 className="h1" style={{ color: "var(--text)" }}>
              Resume.<span className="text-accent">.</span>
            </h1>
          </div>

          {/* Download button */}
          <a
            href="/pdf/Resume.pdf"
            download="Resume-JimmyJarudat.pdf"
            className="inline-flex items-center gap-2 font-mono text-[12px] tracking-wide px-5 py-3 rounded-lg border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <IcoDownload /> {r.downloadPdf}
          </a>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-12">

          {/* ══ LEFT — Experience + Education ══ */}
          <div>

            {/* Experience */}
            <p className="text-accent text-[10px] font-mono tracking-[0.22em] uppercase mb-6">
              {r.sectionExperience}
            </p>

            <div className="space-y-0">
              {EXPERIENCE_META.map((meta, i) => (
                <div
                  key={i}
                  className="relative pl-5 pb-10 border-l"
                  style={{ borderColor: border }}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-accent"
                    style={{ boxShadow: "0 0 8px var(--accent)" }}
                  />

                  {/* Period */}
                  <p className="font-mono text-[10px] tracking-widest uppercase text-accent mb-1.5">
                    {meta.period}
                  </p>

                  {/* Role */}
                  <h3 className="font-bold text-[16px] mb-0.5" style={{ color: "var(--text)" }}>
                    {r.experience[i].role}
                  </h3>
                  <p className="font-mono text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>
                    {meta.company}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border text-accent"
                        style={{
                          borderColor: "rgba(var(--accent-rgb, 0,200,200),0.4)",
                          background: "rgba(var(--accent-rgb, 0,200,200),0.05)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-1.5">
                    {r.experience[i].bullets.map((b, j) => (
                      <li
                        key={j}
                        className="flex gap-2 font-mono text-[12px] leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span className="text-accent mt-0.5 shrink-0">·</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* End dot */}
              <div className="relative pl-5 border-l" style={{ borderColor: border }}>
                <div
                  className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-accent"
                  style={{ background: "var(--bg)" }}
                />
              </div>
            </div>

            {/* Education */}
            <div className="mt-12 pt-10 border-t" style={{ borderColor: border }}>
              <p className="text-accent text-[10px] font-mono tracking-[0.22em] uppercase mb-5">
                {r.sectionEducation}
              </p>
              <div className="space-y-4">
                {EDUCATION_META.map((edu, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5 rounded-xl border"
                    style={{ borderColor: border, background: cardBg }}
                  >
                    {/* Logo */}
                    <img
                      src={edu.logo}
                      alt={edu.name}
                      className="w-14 h-14 rounded-full object-cover shrink-0 border"
                      style={{ borderColor: border }}
                    />
                    <div>
                      <span className="font-mono text-[9px] tracking-widest uppercase text-accent">
                        {r.education[i].level}
                      </span>
                      <p className="font-bold text-[14px] mt-0.5 mb-0.5" style={{ color: "var(--text)" }}>
                        {edu.name}
                      </p>
                      <p className="font-mono text-[12px] text-accent mb-1">
                        {edu.major}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <span>{r.eduFaculty}: {r.education[i].faculty}</span>
                        <span>{r.eduGpa}: {edu.gpa}</span>
                        <span>{r.eduGraduated}: {edu.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RIGHT — Skills + Languages ══ */}
          <div className="xl:sticky xl:top-20 xl:self-start space-y-4">

            <p className="text-accent text-[10px] font-mono tracking-[0.22em] uppercase mb-6">
              {r.sectionSkills}
            </p>

            {SKILL_ITEMS.map((items, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border"
                style={{ borderColor: border, background: cardBg }}
              >
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-accent">
                  {r.skillCategories[i]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[11px] px-2.5 py-1 rounded border"
                      style={{
                        borderColor: border,
                        color: "var(--text-muted)",
                        background: mutedBg,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Languages */}
            <div
              className="p-4 rounded-xl border"
              style={{ borderColor: border, background: cardBg }}
            >
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-4 text-accent">
                {r.sectionLanguages}
              </p>
              {([100, 65] as const).map((pct, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex justify-between font-mono text-[11px] mb-1.5">
                    <span style={{ color: "var(--text)" }}>{r.humanLanguages[i].lang}</span>
                    <span style={{ color: "var(--text-muted)" }}>{r.humanLanguages[i].level}</span>
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: border }}
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumePage;