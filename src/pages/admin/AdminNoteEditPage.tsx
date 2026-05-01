// pages/AdminNoteEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminGetNote,
  adminCreateNote,
  adminUpdateNote,
  type NoteRow,
  type NoteSection,
} from "@/services/adminNotesService";

// ─── helpers ──────────────────────────────────────────────────────────────────

const emptySection = (): NoteSection => ({
  section_order: 0,
  heading:       "",
  body:          "",
  is_callout:    false,
  image:         null,
  image_caption: null,
});

const emptyNote = (): NoteRow => ({
  slug:         "",
  title:        "",
  subtitle:     "",
  tags:         [],
  note_year:    String(new Date().getFullYear()),
  read_time:    "5 min",
  hero_image:   null,
  hero_caption: null,
  sections:     [emptySection()],
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[10px] tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
    {children}
  </p>
);

const inputCls = "w-full bg-transparent font-mono text-[13px] outline-none py-2 px-3 rounded-lg border transition-colors duration-150 focus:border-accent/60 placeholder:opacity-25";
const inputStyle = { borderColor: "rgba(255,255,255,0.09)", color: "var(--text)" };

const Field = ({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
      style={inputStyle}
    />
  </div>
);

const TextArea = ({
  label, value, onChange, placeholder, rows = 4,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) => (
  <div>
    <Label>{label}</Label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputCls} resize-y`}
      style={inputStyle}
    />
  </div>
);

// ─── Section editor ───────────────────────────────────────────────────────────

const SectionEditor = ({
  section, index, total, border,
  onChange, onMove, onRemove,
}: {
  section:  NoteSection;
  index:    number;
  total:    number;
  border:   string;
  onChange: (s: NoteSection) => void;
  onMove:   (from: number, to: number) => void;
  onRemove: () => void;
}) => {
  const set = <K extends keyof NoteSection>(k: K, v: NoteSection[K]) =>
    onChange({ ...section, [k]: v });

  return (
    <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: border, background: "rgba(255,255,255,0.015)" }}>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--accent)", opacity: 0.6 }}>
          section {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {/* Move up */}
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            className="font-mono text-[11px] px-2 py-1 rounded border transition-all disabled:opacity-20"
            style={{ borderColor: border, color: "var(--text-muted)" }}
          >
            ↑
          </button>
          {/* Move down */}
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
            className="font-mono text-[11px] px-2 py-1 rounded border transition-all disabled:opacity-20"
            style={{ borderColor: border, color: "var(--text-muted)" }}
          >
            ↓
          </button>
          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded border transition-all hover:border-red-400/50 hover:text-red-400"
            style={{ borderColor: border, color: "var(--text-muted)" }}
          >
            ลบ
          </button>
        </div>
      </div>

      <Field
        label="Heading"
        value={section.heading}
        onChange={(v) => set("heading", v)}
        placeholder="หัวข้อ section"
      />

      <TextArea
        label="Body"
        value={section.body}
        onChange={(v) => set("body", v)}
        placeholder="เนื้อหา…"
        rows={5}
      />

      {/* Callout toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set("is_callout", !section.is_callout)}
          className="flex items-center gap-2 font-mono text-[11px] tracking-wide transition-colors"
          style={{ color: section.is_callout ? "var(--accent)" : "var(--text-muted)" }}
        >
          <span
            className="w-4 h-4 rounded border flex items-center justify-center transition-all"
            style={{
              borderColor: section.is_callout ? "var(--accent)" : "rgba(255,255,255,0.15)",
              background:  section.is_callout ? "rgba(99,219,188,0.12)" : "transparent",
            }}
          >
            {section.is_callout && <span className="text-[9px]">✓</span>}
          </span>
          Callout block
        </button>
      </div>

      {/* Section image */}
      <Field
        label="Image URL (optional)"
        value={section.image ?? ""}
        onChange={(v) => set("image", v || null)}
        placeholder="https://…"
      />
      {section.image && (
        <Field
          label="Image caption"
          value={section.image_caption ?? ""}
          onChange={(v) => set("image_caption", v || null)}
          placeholder="คำอธิบายภาพ"
        />
      )}
    </div>
  );
};

// ─── Main edit page ───────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

const AdminNoteEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const isNew     = id === undefined || id === "new";

  const border = "rgba(255,255,255,0.07)";

  const [note, setNote]         = useState<NoteRow>(emptyNote());
  const [loading, setLoading]   = useState(!isNew);
  const [status, setStatus]     = useState<SaveStatus>("idle");
  const [tagInput, setTagInput] = useState("");

  // load existing
  useEffect(() => {
    if (isNew) return;
    adminGetNote(Number(id))
      .then((data) => {
        setNote(data);
        setTagInput(data.tags.join(", "));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // ── field helpers ──
  const setField = <K extends keyof NoteRow>(k: K, v: NoteRow[K]) =>
    setNote((n) => ({ ...n, [k]: v }));

  // ── sections ──
  const updateSection = (i: number, s: NoteSection) =>
    setNote((n) => {
      const sections = [...n.sections];
      sections[i] = s;
      return { ...n, sections };
    });

  const addSection = () =>
    setNote((n) => ({ ...n, sections: [...n.sections, emptySection()] }));

  const removeSection = (i: number) =>
    setNote((n) => ({ ...n, sections: n.sections.filter((_, idx) => idx !== i) }));

  const moveSection = (from: number, to: number) =>
    setNote((n) => {
      const sections = [...n.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      return { ...n, sections };
    });

  // ── tags: parse from comma-separated string on blur ──
  const handleTagBlur = () => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setField("tags", tags);
  };

  // ── save ──
  const handleSave = async () => {
    setStatus("saving");
    try {
      const payload: NoteRow = {
        ...note,
        tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (isNew) {
        const newId = await adminCreateNote(payload);
        setStatus("saved");
        setTimeout(() => navigate(`/admin/notes/${newId}/edit`), 800);
      } else {
        await adminUpdateNote(Number(id), payload);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p className="font-mono text-[12px] animate-pulse" style={{ color: "var(--text-muted)" }}>
          กำลังโหลด…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-6 py-12" style={{ background: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate("/admin/notes")}
              className="font-mono text-[10px] tracking-widest uppercase mb-3 block transition-colors hover:text-accent"
              style={{ color: "var(--text-muted)" }}
            >
              ← notes
            </button>
            <h1 className="font-bold text-2xl" style={{ color: "var(--text)" }}>
              {isNew ? "New Note" : "Edit Note"}<span style={{ color: "var(--accent)" }}>.</span>
            </h1>
            <div className="w-6 h-0.5 bg-accent opacity-60 rounded mt-3" />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="font-mono text-[11px] tracking-widest uppercase px-5 py-2.5 rounded-lg border transition-all duration-150 disabled:opacity-50"
            style={{
              borderColor: status === "error" ? "rgba(248,113,113,0.6)" : "var(--accent)",
              color:       status === "error" ? "rgba(248,113,113,0.9)" : "var(--accent)",
              background:  status === "saved" ? "rgba(99,219,188,0.12)" : "rgba(99,219,188,0.05)",
            }}
          >
            {status === "saving" ? "กำลังบันทึก…"
              : status === "saved"  ? "✓ บันทึกแล้ว"
              : status === "error"  ? "✕ เกิดข้อผิดพลาด"
              : "บันทึก"}
          </button>
        </div>

        {/* ── Note fields ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <p className="font-mono text-[10px] tracking-widest uppercase whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              ข้อมูลหลัก
            </p>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          <Field label="Title"    value={note.title}    onChange={(v) => setField("title", v)}    placeholder="ชื่อบทความ" />
          <Field label="Subtitle" value={note.subtitle} onChange={(v) => setField("subtitle", v)} placeholder="คำอธิบายสั้น" />
          <Field label="Slug"     value={note.slug}     onChange={(v) => setField("slug", v)}     placeholder="my-note-slug" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year"      value={note.note_year} onChange={(v) => setField("note_year", v)} placeholder="2024" />
            <Field label="Read time" value={note.read_time} onChange={(v) => setField("read_time", v)} placeholder="5 min" />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (คั่นด้วย comma)</Label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={handleTagBlur}
              placeholder="Docker, TypeScript, Node.js"
              className={inputCls}
              style={inputStyle}
            />
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border"
                    style={{ borderColor: border, color: "var(--text-muted)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Hero image ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <p className="font-mono text-[10px] tracking-widest uppercase whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              hero image
            </p>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          <Field
            label="Hero image URL"
            value={note.hero_image ?? ""}
            onChange={(v) => setField("hero_image", v || null)}
            placeholder="https://…"
          />
          {note.hero_image && (
            <>
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: border }}>
                <img src={note.hero_image} alt="hero preview" className="w-full object-cover max-h-40" />
              </div>
              <Field
                label="Hero caption"
                value={note.hero_caption ?? ""}
                onChange={(v) => setField("hero_caption", v || null)}
                placeholder="คำอธิบายภาพ"
              />
            </>
          )}
        </section>

        {/* ── Sections ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="font-mono text-[10px] tracking-widest uppercase whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              sections ({note.sections.length})
            </p>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          {note.sections.map((s, i) => (
            <SectionEditor
              key={i}
              section={s}
              index={i}
              total={note.sections.length}
              border={border}
              onChange={(updated) => updateSection(i, updated)}
              onMove={moveSection}
              onRemove={() => removeSection(i)}
            />
          ))}

          <button
            type="button"
            onClick={addSection}
            className="w-full font-mono text-[11px] tracking-widest uppercase py-3 rounded-xl border border-dashed transition-all duration-150 hover:border-accent/50 hover:text-accent"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "var(--text-muted)" }}
          >
            + เพิ่ม section
          </button>
        </section>

        {/* ── Bottom save ── */}
        <div className="flex justify-end pt-4 pb-12">
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="font-mono text-[11px] tracking-widest uppercase px-6 py-3 rounded-lg border transition-all duration-150 disabled:opacity-50"
            style={{
              borderColor: "var(--accent)",
              color:       "var(--accent)",
              background:  "rgba(99,219,188,0.05)",
            }}
          >
            {status === "saving" ? "กำลังบันทึก…" : status === "saved" ? "✓ บันทึกแล้ว" : "บันทึก"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminNoteEditPage;