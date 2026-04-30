import { useTheme } from "@/contexts/ThemeContext";

// ─── Data ─────────────────────────────────────────────────────────────────────
const EXPERIENCE = [
  {
    role: "IT Specialist",
    company: "Professional Filing Service Co., Ltd.",
    period: "Jan 2025 — Feb 2026",
    tags: ["Full-stack Dev", "DevOps", "Infrastructure"],
    bullets: [
      "Developed full-stack web applications (React, Next.js, Node.js) with RESTful APIs and auth (JWT, RBAC, Social Login)",
      "Managed and optimized databases — SQL Server, MariaDB, MongoDB",
      "Deployed production systems via Docker, managed environment configuration and CI/CD pipelines",
      "Configured servers (Windows Server, Ubuntu), domain/subdomain, MikroTik, Firewall, NAT, VPN",
      "Replaced legacy systems with modern architecture for performance and scalability",
      "Implemented backup, monitoring, and notification systems (Telegram / LINE)",
      "Diagnosed and resolved issues across application, server, and network systems",
    ],
  },
  {
    role: "IT Support",
    company: "Supornchai Company Limited",
    period: "Aug — Dec 2024",
    tags: ["Support", "Network", "Infrastructure"],
    bullets: [
      "Installed and maintained IT systems — computers, servers, and network devices",
      "Provided troubleshooting for software, hardware, and network connectivity issues",
      "Managed routers, switches, and firewall systems",
      "Ensured system stability and uptime through regular maintenance",
      "Managed IT assets: PC, IP Phone, printers",
    ],
  },
  {
    role: "Student Teacher",
    company: "Chonburi Technical College",
    period: "May 2023 — May 2024",
    tags: ["Teaching", "Microcontrollers", "Mobile Dev"],
    bullets: [
      "Teaching in the course of Microcontrollers",
      "Teaching in the course of Introduction to Application Programming on Mobile Devices",
      "Teaching in the course of Fundamentals of Electrical and Electronic",
    ],
  },
];

const EDUCATION = [
  {
    level: "Bachelor's Degree",
    name: "King Mongkut's Institute of Technology Ladkrabang",
    faculty: "Industrial Education and Technology",
    major: "Computer Engineering",
    gpa: "2.76",
    year: "2022",
    logo: "/images/kmitl.png",
  },
  {
    level: "Vocational Certificate",
    name: "Sri Songkhram Industrial Technology College, Nakhon Phanom University",
    faculty: "Electronics Technician",
    major: "Electronics",
    gpa: "3.55",
    year: "2017",
    logo: "/images/Na.png",
  },
];

const SKILLS = [
  {
    category: "Frontend & Mobile",
    items: ["React", "React Native", "Next.js", "Vite", "Tailwind CSS"],
  },
  {
    category: "Backend",
    items: ["Node.js", "NestJS", "Elysia.js", "REST API"],
  },
  {
    category: "Database",
    items: ["SQL Server", "MariaDB", "MongoDB", "Firebase"],
  },
  {
    category: "DevOps & Infra",
    items: ["Docker", "CI/CD", "Ubuntu", "Windows Server"],
  },
  {
    category: "Network",
    items: ["MikroTik", "Firewall", "NAT", "VPN"],
  },
  {
    category: "Languages",
    items: ["JavaScript", "TypeScript", "C#", "HTML/CSS"],
  },
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
              Experience & Skills
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
            <IcoDownload /> Download PDF
          </a>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-12">

          {/* ══ LEFT — Experience + Education ══ */}
          <div>

            {/* Experience */}
            <p className="text-accent text-[10px] font-mono tracking-[0.22em] uppercase mb-6">
              Work Experience
            </p>

            <div className="space-y-0">
              {EXPERIENCE.map((exp, i) => (
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
                    {exp.period}
                  </p>

                  {/* Role */}
                  <h3 className="font-bold text-[16px] mb-0.5" style={{ color: "var(--text)" }}>
                    {exp.role}
                  </h3>
                  <p className="font-mono text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>
                    {exp.company}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {exp.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border text-accent"
                        style={{
                          borderColor: "rgba(var(--accent-rgb, 0,200,200),0.4)",
                          background: "rgba(var(--accent-rgb, 0,200,200),0.05)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-1.5">
                    {exp.bullets.map((b, j) => (
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
                Education
              </p>
              <div className="space-y-4">
                {EDUCATION.map((edu, i) => (
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
                      <span
                        className="font-mono text-[9px] tracking-widest uppercase text-accent"
                      >
                        {edu.level}
                      </span>
                      <p className="font-bold text-[14px] mt-0.5 mb-0.5" style={{ color: "var(--text)" }}>
                        {edu.name}
                      </p>
                      <p className="font-mono text-[12px] text-accent mb-1">
                        {edu.major}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <span>Faculty: {edu.faculty}</span>
                        <span>GPA: {edu.gpa}</span>
                        <span>Graduated: {edu.year}</span>
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
              Technical Skills
            </p>

            {SKILLS.map((group) => (
              <div
                key={group.category}
                className="p-4 rounded-xl border"
                style={{ borderColor: border, background: cardBg }}
              >
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-accent">
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
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
                Languages
              </p>
              {[
                { lang: "Thai", level: "Native", pct: 100 },
                { lang: "English", level: "Upper Intermediate", pct: 65 },
              ].map((l) => (
                <div key={l.lang} className="mb-3 last:mb-0">
                  <div className="flex justify-between font-mono text-[11px] mb-1.5">
                    <span style={{ color: "var(--text)" }}>{l.lang}</span>
                    <span style={{ color: "var(--text-muted)" }}>{l.level}</span>
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: border }}
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${l.pct}%` }}
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