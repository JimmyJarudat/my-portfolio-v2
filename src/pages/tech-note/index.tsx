import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

import { getNotes } from "@/services/notesService";

const NOTES_PER_PAGE = 10;

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

// ─── Pagination Controls ───────────────────────────────────────────────────────
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  border,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  border: string;
}) => {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis logic
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-mono text-[11px] tracking-wide px-3 py-1.5 rounded border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent/50 hover:text-accent"
        style={{ borderColor: border, color: "var(--text-muted)" }}
      >
        ←
      </button>

      {/* Pages */}
      {getPages().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="font-mono text-[11px] px-2"
            style={{ color: "var(--text-muted)" }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className="font-mono text-[11px] tracking-wide w-8 h-8 rounded border transition-all duration-150"
            style={
              p === currentPage
                ? {
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                    background: "rgba(99,219,188,0.08)",
                  }
                : { borderColor: border, color: "var(--text-muted)" }
            }
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="font-mono text-[11px] tracking-wide px-3 py-1.5 rounded border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent/50 hover:text-accent"
        style={{ borderColor: border, color: "var(--text-muted)" }}
      >
        →
      </button>
    </div>
  );
};

// ─── Tech Notes Page ──────────────────────────────────────────────────────────
const TechNotesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  // ── Filter by search query (title + subtitle + tags) ──
  const q = search.trim().toLowerCase();
  const filteredNotes = q
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subtitle.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    : notes;

  const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * NOTES_PER_PAGE,
    currentPage * NOTES_PER_PAGE
  );

  useEffect(() => {
    getNotes().then(setNotes).catch(console.error);
  }, []);

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              className="font-mono text-[13px] leading-relaxed mb-8 max-w-xl"
              style={{ color: "var(--text-muted)" }}
            >
              บันทึกสิ่งที่เรียนรู้จากการทำงานจริง — ปัญหาที่เจอ วิธีที่แก้ และสิ่งที่อยากจำไว้
            </p>

            {/* ── Search box ── */}
            <div className="relative mb-6 max-w-sm">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] pointer-events-none select-none"
                style={{ color: "var(--text-muted)" }}
              >
                ⌕
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหา title, tag…"
                className="w-full font-mono text-[12px] pl-8 pr-8 py-2 rounded-lg border bg-transparent outline-none transition-all duration-150 focus:border-accent/60 placeholder:opacity-40"
                style={{
                  borderColor: border,
                  color: "var(--text)",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] transition-colors hover:text-accent"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* ── Note count ── */}
            {notes.length > 0 && (
              <p
                className="font-mono text-[10px] tracking-widest uppercase mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                {q
                  ? `พบ ${filteredNotes.length} จาก ${notes.length} notes`
                  : `${notes.length} notes · หน้า ${currentPage} / ${totalPages}`}
              </p>
            )}

            {/* ── Note list ── */}
            {filteredNotes.length === 0 ? (
              <p
                className="font-mono text-[13px] py-16 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                ไม่พบ note ที่ตรงกับ &ldquo;{search}&rdquo;
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedNotes.map((note, idx) => {
                  const globalIndex = (currentPage - 1) * NOTES_PER_PAGE + idx + 1;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedId(note.id)}
                      className="group p-5 rounded-xl border cursor-pointer transition-all duration-150 hover:border-accent/40"
                      style={{ borderColor: border, background: cardBg }}
                    >
                      {/* Index + Tags row */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="font-mono text-[10px] tracking-widest tabular-nums text-accent opacity-50 select-none"
                        >
                          {String(globalIndex).padStart(2, "0")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {note.tags.map((t) => (
                            <span
                              key={t}
                              className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border ${getTagClass(t)}`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
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
                  );
                })}
              </div>
            )}

            {/* ── Pagination (hide when searching) ── */}
            {!q && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                border={border}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default TechNotesPage;