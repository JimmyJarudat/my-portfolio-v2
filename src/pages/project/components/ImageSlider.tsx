import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export const ImageSlider = ({
  images,
  onLightbox,
}: {
  images: string[];
  onLightbox: (idx: number) => void;
}) => {
  const [cur, setCur] = useState(0);

  useEffect(() => { setCur(0); }, [images]);

  const prev = () => setCur((c) => (c - 1 + images.length) % images.length);
  const next = () => setCur((c) => (c + 1) % images.length);

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 mb-7 group">
      {/* Image */}
      <div
        className="relative aspect-[16/9] overflow-hidden cursor-zoom-in"
        onClick={() => onLightbox(cur)}
      >
        <img
          key={cur}
          src={images[cur]}
          alt={`preview ${cur + 1}`}
          className="w-full h-full object-cover brightness-75 group-hover:brightness-90 scale-100 group-hover:scale-105 transition-all duration-500"
        />
        <span className="absolute bottom-2 right-3 text-[9px] tracking-widest text-white/40 pointer-events-none select-none">
          ⊕ zoom
        </span>
      </div>

      {/* Controls */}
      {images.length > 1 && (
        <>
          {/* Counter */}
          <span className="absolute top-2 right-3 text-[9px] font-mono tracking-widest text-white/50 bg-black/50 rounded px-2 py-0.5 z-10">
            {cur + 1} / {images.length}
          </span>

          {/* Prev */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
          >
            <ChevronRight size={14} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCur(i); }}
                className={`h-1.5 rounded-full transition-all duration-200 border-none cursor-pointer
                  ${i === cur ? "w-5 bg-accent" : "w-1.5 bg-white/35"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};