import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

import { getNotes } from "@/services/notesService";
import { Pagination } from "@/components/Pagination";

const NOTES_PER_PAGE = 10;
type Language = "th" | "en";

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

const textFor = (language: Language, thText?: string, enText?: string) =>
  language === "en" && enText?.trim() ? enText : thText ?? "";

// ─── Note Detail (Article Layout) ─────────────────────────────────────────────
const NoteDetail = ({
  note,
  border,
  language,
  backLabel,
  onBack,
}: {
  note: Note;
  border: string;
  language: Language;
  backLabel: string;
  onBack: () => void;
}) => {
  const title = textFor(language, note.title, note.titleEn);
  const subtitle = textFor(language, note.subtitle, note.subtitleEn);
  const heroCaption = textFor(language, note.heroCaption, note.heroCaptionEn);

  return (
  <div>
    {/* Back */}
    <button
      onClick={onBack}
      className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide mb-8 hover:text-accent transition-colors"
      style={{ color: "var(--text-muted)" }}
    >
      {backLabel}
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
      {title}
    </h2>
    <p className="font-mono text-[13px] mb-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
      {subtitle}
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
          alt={title}
          className="w-full object-cover max-h-72"
          loading="lazy"
        />
        {heroCaption && (
          <p
            className="font-mono text-[10px] px-4 py-2"
            style={{ color: "var(--text-muted)", borderTop: `1px solid ${border}` }}
          >
            📷 {heroCaption}
          </p>
        )}
      </div>
    )}

    {/* Divider */}
    <div className="w-8 h-0.5 bg-accent opacity-60 rounded mb-8" />

    {/* Sections */}
    <div className="space-y-8">
      {note.sections.map((s, i) => {
        const heading = textFor(language, s.heading, s.headingEn);
        const body = textFor(language, s.body, s.bodyEn);

        return (
        <div key={i}>
          {/* Section heading */}
          <div className="flex items-center gap-3 mb-3">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent whitespace-nowrap">
              {heading}
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
                {body}
              </p>
            </div>
          ) : (
            <>
              <p
                className="font-mono text-[13px] leading-relaxed whitespace-pre-line"
                style={{ color: "var(--text-muted)" }}
              >
                {body}
              </p>

              {/* Section inline image */}
              {s.image && (
                <div
                  className="rounded-lg overflow-hidden border mt-4"
                  style={{ borderColor: border }}
                >
                  <img
                    src={s.image}
                    alt={heading}
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
        );
      })}
    </div>
  </div>
  );
};



// ─── helpers: read / write ?note=slug in the URL ─────────────────────────────
const getNoteSlugFromURL = () =>
  new URLSearchParams(window.location.search).get("note") ?? null;

// ─── Tech Notes Page ──────────────────────────────────────────────────────────
const TechNotesPage = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const noteText = t.techNote;
  const isDark = theme === "dark";
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  // slug of the currently-open note (drives URL + view)
  const [activeSlug, setActiveSlug] = useState<string | null>(getNoteSlugFromURL);

  // remember scroll position + page before opening a note
  const savedScroll = useRef(0);
  const savedPage   = useRef(1);

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";

  const selectedNote = activeSlug ? notes.find((n) => n.slug === activeSlug) ?? null : null;

  // ── Filter by search query (title + subtitle + tags) ──
  const q = search.trim().toLowerCase();
  const filteredNotes = q
    ? notes.filter(
        (n) =>
          textFor(language, n.title, n.titleEn).toLowerCase().includes(q) ||
          textFor(language, n.subtitle, n.subtitleEn).toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    : notes;

  const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * NOTES_PER_PAGE,
    currentPage * NOTES_PER_PAGE
  );

  // ── Load notes ──
  useEffect(() => {
    getNotes().then(setNotes).catch(console.error);
  }, []);

  // ── Sync URL → state when user hits browser Back/Forward ──
  useEffect(() => {
    const onPop = () => {
      const slug = getNoteSlugFromURL();
      setActiveSlug(slug);
      if (!slug) {
        setCurrentPage(savedPage.current);
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScroll.current, behavior: "instant" });
        });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ── Open a note ──
  const openNote = (note: Note) => {
    savedScroll.current = window.scrollY;
    savedPage.current   = currentPage;
    setActiveSlug(note.slug);
    window.history.pushState({ slug: note.slug }, "", `${window.location.pathname}?note=${note.slug}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // ── Close / back button inside the article ──
  const closeNote = () => {
    setActiveSlug(null);
    window.history.pushState({}, "", window.location.pathname);
    setCurrentPage(savedPage.current);
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScroll.current, behavior: "instant" });
    });
  };

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
            {noteText.eyebrow}
          </p>
          <h1 className="h1" style={{ color: "var(--text)" }}>
            Tech Notes.<span className="text-accent">.</span>
          </h1>
        </div>

        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            border={border}
            language={language}
            backLabel={noteText.back}
            onBack={closeNote}
          />
        ) : (
          <>
            {/* ── Intro ── */}
            <p
              className="font-mono text-[13px] leading-relaxed mb-8 max-w-xl"
              style={{ color: "var(--text-muted)" }}
            >
              {noteText.intro}
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
                placeholder={noteText.searchPlaceholder}
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
                  ? `${noteText.countFound} ${filteredNotes.length} ${noteText.countFrom} ${notes.length} ${noteText.notes}`
                  : `${notes.length} ${noteText.notes} · ${noteText.page} ${currentPage} / ${totalPages}`}
              </p>
            )}

            {/* ── Note list ── */}
            {filteredNotes.length === 0 ? (
              <p
                className="font-mono text-[13px] py-16 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                {noteText.notFound} &ldquo;{search}&rdquo;
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedNotes.map((note, idx) => {
                  const globalIndex = (currentPage - 1) * NOTES_PER_PAGE + idx + 1;
                  const title = textFor(language, note.title, note.titleEn);
                  const subtitle = textFor(language, note.subtitle, note.subtitleEn);

                  return (
                    <div
                      key={note.id}
                      onClick={() => openNote(note)}
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
                            {title}
                          </h3>
                          <p
                            className="font-mono text-[12px] leading-relaxed mb-4"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {subtitle}
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
                              alt={title}
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
                          {noteText.readMore}
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
