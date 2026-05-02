// pages/GuidesPage.tsx
import { useRef, useState } from "react";
import { GUIDES } from "../../data/guide.data";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "beginner" | "intermediate" | "advanced";
type Category = "infrastructure" | "docker-swarm" | "observability";




// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category | "all"; label: string; icon: string }[] = [
    { key: "all", label: "ทั้งหมด", icon: "✦" },
    { key: "infrastructure", label: "Infrastructure", icon: "⬡" },
    { key: "docker-swarm", label: "Docker Swarm", icon: "◈" },
    { key: "observability", label: "Observability", icon: "◎" },
];

const DIFF: Record<Difficulty, { label: string; color: string; bg: string }> = {
    beginner: { label: "Beginner", color: "#4ade80", bg: "rgba(74,222,128,0.08)" },
    intermediate: { label: "Intermediate", color: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
    advanced: { label: "Advanced", color: "#f87171", bg: "rgba(248,113,113,0.08)" },
};

const getSlugFromURL = () =>
    new URLSearchParams(window.location.search).get("guide") ?? null;

// ─── Shared components ────────────────────────────────────────────────────────

const DiffBadge = ({ level }: { level: Difficulty }) => {
    const { label, color, bg } = DIFF[level];
    return (
        <span className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border"
            style={{ color, background: bg, borderColor: color + "33" }}>
            {label}
        </span>
    );
};

const Tag = ({ label }: { label: string }) => (
    <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
        {label}
    </span>
);

// ─── Code Block ───────────────────────────────────────────────────────────────

const CodeBlock = ({ code, lang }: { code: string; lang?: string }) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <div className="rounded-xl overflow-hidden mt-3"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-mono text-[10px] tracking-widest uppercase"
                    style={{ color: "var(--text-muted)", opacity: 0.4 }}>
                    {lang ?? "bash"}
                </span>
                <button onClick={copy}
                    className="font-mono text-[10px] tracking-widest uppercase transition-colors"
                    style={{ color: copied ? "var(--accent)" : "var(--text-muted)", opacity: copied ? 1 : 0.5 }}>
                    {copied ? "✓ copied" : "copy"}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-[12px] leading-relaxed"
                style={{ color: "var(--accent)", margin: 0 }}>
                <code>{code}</code>
            </pre>
        </div>
    );
};

// ─── Step Image ───────────────────────────────────────────────────────────────

const StepImage = ({ src, caption }: { src: string; caption?: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <div className="mt-3 rounded-xl overflow-hidden cursor-zoom-in"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                onClick={() => setOpen(true)}>
                <img src={src} alt={caption ?? ""} className="w-full object-cover max-h-72 transition-transform duration-300 hover:scale-[1.02]" />
                {caption && (
                    <p className="px-3 py-2 font-mono text-[10px] tracking-wide"
                        style={{ color: "var(--text-muted)", opacity: 0.55, background: "rgba(0,0,0,0.3)" }}>
                        ↳ {caption}
                    </p>
                )}
            </div>

            {/* Lightbox */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.85)" }}
                    onClick={() => setOpen(false)}>
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute -top-8 right-0 font-mono text-[11px] tracking-widest uppercase transition-colors"
                            style={{ color: "var(--text-muted)" }}
                            onClick={() => setOpen(false)}>
                            ✕ ปิด
                        </button>
                        <img src={src} alt={caption ?? ""} className="w-full rounded-xl object-contain max-h-[80vh]" />
                        {caption && (
                            <p className="text-center font-mono text-[11px] mt-3" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                                {caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

// ─── Guide Detail ─────────────────────────────────────────────────────────────

const GuideDetail = ({ guide, onBack }: { guide: Guide; onBack: () => void }) => {
    const border = "rgba(255,255,255,0.07)";
    return (
        <div className="max-w-2xl mx-auto px-6 py-10">

            <button onClick={onBack}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide mb-8 hover:text-accent transition-colors"
                style={{ color: "var(--text-muted)" }}>
                ← กลับ
            </button>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <DiffBadge level={guide.difficulty} />
                <span className="font-mono text-[10px] tracking-widest uppercase"
                    style={{ color: "var(--text-muted)", opacity: 0.5 }}>
                    {guide.steps.length} steps · {guide.time} · {guide.updated}
                </span>
            </div>

            <h1 className="font-bold text-2xl xl:text-3xl leading-snug mb-3" style={{ color: "var(--text)" }}>
                {guide.title}
            </h1>
            <p className="font-mono text-[13px] leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                {guide.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-6">
                {guide.tags.map((t) => <Tag key={t} label={t} />)}
            </div>

            {/* Prerequisites */}
            {guide.prerequisites && (
                <div className="rounded-xl border p-4 mb-8"
                    style={{ borderColor: "rgba(99,219,188,0.2)", background: "rgba(99,219,188,0.03)" }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase mb-3"
                        style={{ color: "var(--accent)", opacity: 0.7 }}>
                        ✦ prerequisites
                    </p>
                    <ul className="space-y-1.5">
                        {guide.prerequisites.map((p, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="font-mono text-[11px] mt-0.5" style={{ color: "var(--accent)", opacity: 0.5 }}>–</span>
                                <span className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>{p}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="w-8 h-0.5 bg-accent opacity-60 rounded mb-8" />

            {/* Steps */}
            <div className="space-y-0">
                {guide.steps.map((step, i) => (
                    <div key={i} className="flex gap-5">
                        {/* Number + connector line */}
                        <div className="flex flex-col items-center shrink-0 pt-0.5">
                            <div className="w-7 h-7 rounded-full border flex items-center justify-center shrink-0"
                                style={{ borderColor: "var(--accent)", background: "rgba(99,219,188,0.08)" }}>
                                <span className="font-mono text-[10px] font-bold" style={{ color: "var(--accent)" }}>
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </div>
                            {i < guide.steps.length - 1 && (
                                <div className="w-px flex-1 mt-2 mb-0" style={{ background: "rgba(99,219,188,0.15)", minHeight: "32px" }} />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <h3 className="font-bold text-[15px] mb-1.5 leading-snug" style={{ color: "var(--text)" }}>
                                {step.title}
                            </h3>
                            <p className="font-mono text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                {step.body}
                            </p>
                            {step.code && <CodeBlock code={step.code} lang={step.lang} />}
                            {step.images && step.images.length > 0 && (
                                <div className="space-y-2">
                                    {step.images.map((img, j) => (
                                        <StepImage key={j} src={img.src} caption={img.caption} />
                                    ))}
                                </div>
                            )}
                            {step.note && (
                                <div className="flex items-start gap-2 mt-3 pl-3 border-l-2 border-accent/40">
                                    <p className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
                                        💡 {step.note}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Done banner */}
            <div className="mt-4 p-6 rounded-2xl border text-center"
                style={{ borderColor: "rgba(99,219,188,0.2)", background: "rgba(99,219,188,0.03)" }}>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
                    ✦ เสร็จสิ้น
                </p>
                <p className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>
                    ครบทุก {guide.steps.length} steps — {guide.title}
                </p>
            </div>

            <button onClick={onBack}
                className="mt-8 font-mono text-[11px] tracking-wide hover:text-accent transition-colors block"
                style={{ color: "var(--text-muted)" }}>
                ← กลับไป Guides
            </button>
        </div>
    );
};

// ─── Guide Card ───────────────────────────────────────────────────────────────

const GuideCard = ({ guide, onClick }: { guide: Guide; onClick: () => void }) => {
    const [hovered, setHovered] = useState(false);
    const border = "rgba(255,255,255,0.07)";
    return (
        <div onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden"
            style={{
                borderColor: hovered ? "var(--accent)" : border,
                background: hovered ? "rgba(99,219,188,0.03)" : "rgba(255,255,255,0.02)",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered ? "0 8px 32px rgba(99,219,188,0.08)" : "none",
            }}>
            <div className="h-0.5 transition-all duration-500"
                style={{ background: hovered ? "var(--accent)" : "transparent" }} />
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <DiffBadge level={guide.difficulty} />
                        <span className="font-mono text-[9px] tracking-widest uppercase"
                            style={{ color: "var(--text-muted)", opacity: 0.5 }}>
                            {guide.steps.length} steps · {guide.time}
                        </span>
                    </div>
                    <span className="font-mono text-[10px] shrink-0 transition-colors"
                        style={{ color: hovered ? "var(--accent)" : "var(--text-muted)", opacity: hovered ? 1 : 0.4 }}>
                        {guide.updated}
                    </span>
                </div>
                <div>
                    <h3 className="font-bold text-[16px] leading-snug mb-2 transition-colors"
                        style={{ color: hovered ? "var(--accent)" : "var(--text)" }}>
                        {guide.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {guide.description}
                    </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1.5">
                        {guide.tags.map((t) => <Tag key={t} label={t} />)}
                    </div>
                    <span className="font-mono text-[14px] transition-all duration-300"
                        style={{ color: "var(--accent)", opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-6px)" }}>
                        →
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const GuidesPage = () => {
    const [active, setActive] = useState<Category | "all">("all");
    const [activeSlug, setActiveSlug] = useState<string | null>(getSlugFromURL);
    const savedScroll = useRef(0);

    const border = "rgba(255,255,255,0.07)";
    const filtered = active === "all" ? GUIDES : GUIDES.filter((g) => g.category === active);
    const selected = activeSlug ? GUIDES.find((g) => g.slug === activeSlug) ?? null : null;

    const openGuide = (guide: Guide) => {
        savedScroll.current = window.scrollY;
        setActiveSlug(guide.slug);
        window.history.pushState({ slug: guide.slug }, "", `${window.location.pathname}?guide=${guide.slug}`);
        window.scrollTo({ top: 0, behavior: "instant" });
    };

    const closeGuide = () => {
        setActiveSlug(null);
        window.history.pushState({}, "", window.location.pathname);
        requestAnimationFrame(() =>
            window.scrollTo({ top: savedScroll.current, behavior: "instant" })
        );
    };

    // ── Detail view ──
    if (selected) {
        return (
            <div className="min-h-screen w-full" style={{ background: "var(--bg)" }}>
                <div className="pt-24">
                    <GuideDetail guide={selected} onBack={closeGuide} />
                </div>
            </div>
        );
    }

    // ── List view ──
    return (
        <div className="min-h-screen w-full" style={{ background: "var(--bg)" }}>

            {/* Hero */}
            <div className="relative overflow-hidden pt-32 pb-16 px-6">
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(99,219,188,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,219,188,0.03) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(99,219,188,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />

                <div className="max-w-3xl mx-auto relative">
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4"
                        style={{ color: "var(--accent)", opacity: 0.7 }}>
                        ✦ step-by-step guides
                    </p>
                    <h1 className="font-bold leading-none mb-5"
                        style={{ color: "var(--text)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                        Guides<span style={{ color: "var(--accent)" }}>.</span>
                    </h1>
                    <p className="text-[15px] leading-relaxed max-w-lg" style={{ color: "var(--text-muted)" }}>
                        คู่มือ setup และ deploy จากประสบการณ์ทำงานจริง — ทำตามได้ทันที ตั้งแต่ VPS ใหม่จนถึง production stack
                    </p>
                    <div className="flex items-center gap-6 mt-8">
                        {[
                            { label: "Guides", value: GUIDES.length },
                            { label: "Categories", value: CATEGORIES.length - 1 },
                            { label: "Avg. time", value: "38 min" },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex flex-col">
                                <span className="font-bold text-[22px] tabular-nums" style={{ color: "var(--accent)" }}>{value}</span>
                                <span className="font-mono text-[9px] tracking-widest uppercase"
                                    style={{ color: "var(--text-muted)", opacity: 0.5 }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="sticky top-0 z-10 px-6 py-4"
                style={{ background: "var(--bg)", borderBottom: `1px solid ${border}` }}>
                <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-0.5">
                    {CATEGORIES.map(({ key, label, icon }) => {
                        const isA = active === key;
                        return (
                            <button key={key} onClick={() => setActive(key as Category | "all")}
                                className="font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap shrink-0"
                                style={{
                                    borderColor: isA ? "var(--accent)" : border,
                                    background: isA ? "rgba(99,219,188,0.08)" : "transparent",
                                    color: isA ? "var(--accent)" : "var(--text-muted)",
                                }}>
                                <span className="mr-1.5 opacity-60">{icon}</span>{label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Cards */}
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="flex items-center gap-3 mb-6">
                    <p className="font-mono text-[10px] tracking-widest uppercase whitespace-nowrap"
                        style={{ color: "var(--text-muted)" }}>
                        {active === "all" ? "ทั้งหมด" : CATEGORIES.find(c => c.key === active)?.label}
                        {" "}— {filtered.length} guides
                    </p>
                    <div className="flex-1 h-px" style={{ background: border }} />
                </div>

                <div className="flex flex-col gap-4">
                    {filtered.map((g) => (
                        <GuideCard key={g.id} guide={g} onClick={() => openGuide(g)} />
                    ))}
                </div>

                <div className="mt-12 p-6 rounded-2xl border text-center"
                    style={{ borderColor: border, borderStyle: "dashed" }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase mb-2"
                        style={{ color: "var(--accent)", opacity: 0.6 }}>
                        ✦ more coming soon
                    </p>
                    <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                        กำลังเขียนเพิ่ม — Nginx Proxy Manager, SQL Server backup, Telegram bot
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GuidesPage;