import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { NOTES } from "./data";





// ─── Tag colors ───────────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  Debezium: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  CDC: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  MariaDB: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  "SQL Server": "text-blue-400 border-blue-400/30 bg-blue-400/5",
  "Elysia.js": "text-violet-400 border-violet-400/30 bg-violet-400/5",
  Express: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  Bun: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  TypeScript: "text-sky-400 border-sky-400/30 bg-sky-400/5",
  Encoding: "text-red-400 border-red-400/30 bg-red-400/5",
  "Node.js": "text-green-400 border-green-400/30 bg-green-400/5",
  "TIS-620": "text-red-400 border-red-400/30 bg-red-400/5",
  Docker: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
  Swarm: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
  Ubuntu: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  DevOps: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
};

const getTagClass = (tag: string) =>
  TAG_COLORS[tag] ?? "text-accent border-accent/30 bg-accent/5";

// ─── Note Detail (Article Layout) ─────────────────────────────────────────────
const NoteDetail = ({
  note,
  border,
  cardBg,
  onBack,
}: {
  note: Note;
  border: string;
  cardBg: string;
  onBack: () => void;
}) => (
  <div>
    {/* Back */}
    <button
      onClick={onBack}
      className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide mb-8 hover:text-accent transition-colors"
      style={{ color: "var(--text-muted)" }}
    >
      ← กลับ
    </button>

    {/* Tags */}
    <div className="flex flex-wrap gap-1.5 mb-4">
      {note.tags.map((t) => (
        <span
          key={t}
          className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border ${getTagClass(t)}`}
        >
          {t}
        </span>
      ))}
    </div>

    {/* Title */}
    <h2 className="font-bold text-2xl xl:text-3xl mb-2 leading-snug" style={{ color: "var(--text)" }}>
      {note.title}
    </h2>
    <p className="font-mono text-[13px] mb-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
      {note.subtitle}
    </p>
    <p className="font-mono text-[10px] tracking-widest uppercase text-accent mb-8">
      {note.date} · {note.readTime} read
    </p>

    {/* Hero Image */}
    {note.heroImage && (
      <div
        className="rounded-xl overflow-hidden border mb-8"
        style={{ borderColor: border }}
      >
        <img
          src={note.heroImage}
          alt={note.title}
          className="w-full object-cover max-h-72"
          loading="lazy"
        />
        {note.heroCaption && (
          <p
            className="font-mono text-[10px] px-4 py-2"
            style={{ color: "var(--text-muted)", borderTop: `1px solid ${border}` }}
          >
            📷 {note.heroCaption}
          </p>
        )}
      </div>
    )}

    {/* Divider */}
    <div className="w-8 h-0.5 bg-accent opacity-60 rounded mb-8" />

    {/* Sections */}
    <div className="space-y-8">
      {note.sections.map((s, i) => (
        <div key={i}>
          {/* Section heading */}
          <div className="flex items-center gap-3 mb-3">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent whitespace-nowrap">
              {s.heading}
            </p>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          {/* Body: callout or normal */}
          {s.isCallout ? (
            <div
              className="border-l-2 border-accent pl-4 py-1 rounded-r-lg"
              style={{ background: "rgba(99,219,188,0.04)" }}
            >
              <p
                className="font-mono text-[13px] leading-relaxed whitespace-pre-line"
                style={{ color: "var(--text-muted)" }}
              >
                {s.body}
              </p>
            </div>
          ) : (
            <>
              <p
                className="font-mono text-[13px] leading-relaxed whitespace-pre-line"
                style={{ color: "var(--text-muted)" }}
              >
                {s.body}
              </p>

              {/* Section inline image */}
              {s.image && (
                <div
                  className="rounded-lg overflow-hidden border mt-4"
                  style={{ borderColor: border }}
                >
                  <img
                    src={s.image}
                    alt={s.heading}
                    className="w-full object-cover max-h-56"
                    loading="lazy"
                  />
                  {s.imageCaption && (
                    <p
                      className="font-mono text-[10px] px-3 py-2"
                      style={{
                        color: "var(--text-muted)",
                        borderTop: `1px solid ${border}`,
                      }}
                    >
                      📷 {s.imageCaption}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ─── Tech Notes Page ──────────────────────────────────────────────────────────
const TechNotesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";

  const selectedNote = NOTES.find((n) => n.id === selectedId) ?? null;

  return (
    <section className="min-h-full w-full">
      <div className="container mx-auto px-4 xl:px-0 py-12 xl:py-16">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-accent text-[10px] font-mono tracking-[0.22em] uppercase mb-2">
            Things I Learned
          </p>
          <h1 className="h1" style={{ color: "var(--text)" }}>
            Tech Notes.<span className="text-accent">.</span>
          </h1>
        </div>

        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            border={border}
            cardBg={cardBg}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <>
            {/* ── Intro ── */}
            <p
              className="font-mono text-[13px] leading-relaxed mb-10 max-w-xl"
              style={{ color: "var(--text-muted)" }}
            >
              บันทึกสิ่งที่เรียนรู้จากการทำงานจริง — ปัญหาที่เจอ วิธีที่แก้ และสิ่งที่อยากจำไว้
            </p>

            {/* ── Note list: single column ── */}
            <div className="flex flex-col gap-4">
              {NOTES.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedId(note.id)}
                  className="group p-5 rounded-xl border cursor-pointer transition-all duration-150 hover:border-accent/40"
                  style={{ borderColor: border, background: cardBg }}
                >
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border ${getTagClass(t)}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Title + Hero thumbnail row */}
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-[15px] mb-1.5 group-hover:text-accent transition-colors leading-snug"
                        style={{ color: "var(--text)" }}
                      >
                        {note.title}
                      </h3>
                      <p
                        className="font-mono text-[12px] leading-relaxed mb-4"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {note.subtitle}
                      </p>
                    </div>

                    {/* Thumbnail */}
                    {note.heroImage && (
                      <div
                        className="hidden sm:block flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border"
                        style={{ borderColor: border }}
                      >
                        <img
                          src={note.heroImage}
                          alt={note.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] tracking-widest uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {note.date} · {note.readTime} read
                    </span>
                    <span className="font-mono text-[11px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      อ่านบทความ →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TechNotesPage;