// pages/AdminNotesPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetNotes, adminDeleteNote, type NoteRow } from "@/services/adminNotesService";

const AdminNotesPage = () => {
  const navigate = useNavigate();

  const border = "rgba(255,255,255,0.07)";
  const cardBg = "rgba(255,255,255,0.02)";

  const [notes, setNotes]       = useState<NoteRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirm, setConfirm]   = useState<number | null>(null); // id รอยืนยัน delete

  useEffect(() => {
    adminGetNotes()
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await adminDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
      setConfirm(null);
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-12" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="font-mono text-[10px] tracking-widest uppercase mb-3 block transition-colors hover:text-accent"
              style={{ color: "var(--text-muted)" }}
            >
              ← dashboard
            </button>
            <h1 className="font-bold text-2xl" style={{ color: "var(--text)" }}>
              Notes<span style={{ color: "var(--accent)" }}>.</span>
            </h1>
            <div className="w-6 h-0.5 bg-accent opacity-60 rounded mt-3" />
          </div>

          <button
            onClick={() => navigate("/admin/notes/new")}
            className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 rounded-lg border transition-all duration-150 hover:border-accent/60 hover:text-accent"
            style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "rgba(99,219,188,0.05)" }}
          >
            + new note
          </button>
        </div>

        {/* ── List ── */}
        {loading ? (
          <p className="font-mono text-[12px] animate-pulse" style={{ color: "var(--text-muted)" }}>
            กำลังโหลด…
          </p>
        ) : notes.length === 0 ? (
          <p className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>
            ยังไม่มี note
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note, i) => (
              <div
                key={note.id}
                className="rounded-xl border p-5"
                style={{ borderColor: border, background: cardBg }}
              >
                <div className="flex items-start gap-4">

                  {/* Index */}
                  <span
                    className="font-mono text-[10px] tabular-nums mt-0.5 shrink-0 w-5 text-right"
                    style={{ color: "var(--accent)", opacity: 0.45 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-[14px] leading-snug truncate mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      {note.title}
                    </p>
                    <p
                      className="font-mono text-[11px] truncate mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {note.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
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
                    <p className="font-mono text-[10px]" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
                      {note.note_year} · {note.read_time} read · {note.sections.length} sections · slug: {note.slug}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/admin/notes/${note.id}/edit`)}
                      className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all duration-150 hover:border-accent/50 hover:text-accent"
                      style={{ borderColor: border, color: "var(--text-muted)" }}
                    >
                      edit
                    </button>

                    {confirm === note.id ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDelete(note.id!)}
                          disabled={deleting === note.id}
                          className="font-mono text-[10px] tracking-widest uppercase px-2 py-1.5 rounded-lg border transition-all duration-150 border-red-400/50 text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                        >
                          {deleting === note.id ? "…" : "ยืนยัน"}
                        </button>
                        <button
                          onClick={() => setConfirm(null)}
                          className="font-mono text-[10px] tracking-widest uppercase px-2 py-1.5 rounded-lg border transition-all duration-150"
                          style={{ borderColor: border, color: "var(--text-muted)" }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirm(note.id!)}
                        className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all duration-150 hover:border-red-400/40 hover:text-red-400"
                        style={{ borderColor: border, color: "var(--text-muted)" }}
                      >
                        delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotesPage;