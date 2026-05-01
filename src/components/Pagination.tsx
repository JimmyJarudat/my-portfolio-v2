// ─── Pagination Controls ───────────────────────────────────────────────────────
export const Pagination = ({
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