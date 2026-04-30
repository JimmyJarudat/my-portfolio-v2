import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export const Lightbox = ({
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
      className="fixed inset-0 z-[9999]
             bg-black/60 backdrop-blur-lg
             flex items-center justify-center cursor-zoom-out"
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
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:border-accent transition-colors z-10"
          >
            <ChevronRight size={14} />
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