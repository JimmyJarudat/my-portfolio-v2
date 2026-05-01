import { MdOutlineMail, MdPhone, MdLocationOn } from "react-icons/md";
import { FaGithub, FaGlobe } from "react-icons/fa";

// ─── Data ─────────────────────────────────────────────────────────────────────
const CONTACTS = [
    { icon: MdOutlineMail, label: "jarudat.jc@gmail.com", href: "mailto:jarudat.jc@gmail.com" },
    { icon: MdPhone, label: "(+66) 83 062 5832", href: "tel:+66830625832" },
    { icon: FaGithub, label: "JimmyJarudat", href: "https://github.com/JimmyJarudat" },
    { icon: FaGlobe, label: "portfolio.jarudat.com", href: "https://portfolio.jarudat.com" },
];

// ─── About Page ───────────────────────────────────────────────────────────────
const AboutPage = () => {
    return (
        <section className="min-h-full w-full">
            <div className="container mx-auto px-4 xl:px-0 py-12 xl:py-16">

                {/* ── Top bar: eyebrow + name full-width ── */}
                <div className="mb-10">
                    <p className="text-accent text-[9px] font-mono tracking-[0.25em] uppercase mb-4">
                        Who I Am
                    </p>

                    {/* Name as large display — spans full width */}
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.07]">
                        <h1
                            className="font-syne text-[clamp(36px,7vw,72px)] font-extrabold leading-[1] tracking-tight"
                            style={{ color: "var(--text)" }}
                        >
                            Jarudat Chaikuad
                        </h1>
                        <div className="flex items-center gap-2 pb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 shadow-[0_0_6px_var(--accent)]" />
                            <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--text-muted)" }}>
                                IT Specialist
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Body: photo left, content right ── */}
                <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr] gap-10 xl:gap-16">

                    {/* ── Left: photo card (narrow, tall) ── */}
                    <div
                        className="
                            relative rounded-xl border overflow-hidden
                            flex flex-col items-center justify-center gap-3
                            border-black/[0.08] dark:border-white/[0.07]
                            bg-black/[0.02] dark:bg-white/[0.02]
                            xl:sticky xl:top-8 self-start
                        "
                        style={{ minHeight: "260px" }}
                    >
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(91,255,214,0.06)_0%,transparent_70%)]" />
                        <span className="absolute top-2.5 left-3 font-mono text-[8px] tracking-wider text-black/15 dark:text-white/15">JC / 001</span>
                        <span className="absolute bottom-2.5 right-3 font-mono text-[8px] tracking-wider text-black/15 dark:text-white/15">2025</span>

                        <img src="https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/About.jpg" className="w-full h-full object-cover absolute inset-0" alt="Jarudat Chaikuad" />
                    </div>

                    {/* ── Right: bio + contact ── */}
                    <div>

                        {/* Bio paragraphs */}
                        <p className="font-mono text-[13px] leading-[1.9] mb-4" style={{ color: "var(--text-muted)" }}>
                            ทำงานด้าน IT แบบครบวงจร ครอบคลุมทั้งการพัฒนาระบบและการดูแล infrastructure โดยมีความถนัดในการสร้างเครื่องมือและระบบที่ใช้งานได้จริงในองค์กร ตั้งแต่ internal application ไปจนถึงการบริหารจัดการ server, network และระบบ automation ต่าง ๆ มุ่งเน้นการออกแบบ solution ที่ใช้งานได้จริง ตรงโจทย์ และช่วยแก้ปัญหาได้อย่างมีประสิทธิภาพ
                        </p>
                        <p className="font-mono text-[13px] leading-[1.9] mb-10" style={{ color: "var(--text-muted)" }}>
                            สำเร็จการศึกษาจาก สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
                            คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี สาขาวิศวกรรมคอมพิวเตอร์

                            พร้อมประสบการณ์ในสาย application development, database management, DevOps และ network infrastructure โดยมีแนวคิดว่าเทคโนโลยีที่ดีไม่ใช่เพียงแค่น่าสนใจในเชิงแนวคิด แต่ต้องสามารถช่วยให้ผู้ใช้งานทำงานได้ง่ายขึ้น และสร้างประโยชน์ได้จริงในชีวิตประจำวัน
                        </p>

                        <p className="font-mono text-[13px] leading-[1.9] mb-10" style={{ color: "var(--text-muted)" }}>
                            มี background ด้าน Electronics จากการศึกษาและประสบการณ์สอน Microcontrollers
                            ที่วิทยาลัยเทคนิคชลบุรี ซึ่งช่วยให้เข้าใจ hardware และ infrastructure
                            ได้ลึกกว่านักพัฒนาทั่วไป และสามารถมองปัญหาได้ครบทั้งในมุม software และ physical layer
                        </p>

                        {/* Divider */}
                        <div className="h-px bg-black/[0.08] dark:bg-white/[0.07] mb-8" />

                        {/* Contact label */}
                        <p className="text-accent text-[9px] font-mono tracking-[0.22em] uppercase mb-4">
                            Contact
                        </p>

                        {/* Contact — vertical list style แทน pills */}
                        <div className="flex flex-col gap-3">
                            {CONTACTS.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        group inline-flex items-center gap-3
                                        font-mono text-[12px] transition-colors
                                        hover:text-accent
                                    "
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <span className="w-7 h-7 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                                        border-black/[0.08] dark:border-white/[0.07]
                                        group-hover:border-accent group-hover:text-accent"
                                    >
                                        <Icon className="text-[13px]" />
                                    </span>
                                    {label}
                                </a>
                            ))}
                        </div>

                        {/* Location */}
                        <div className="mt-6 flex items-center gap-1.5 font-mono text-[11px] text-black/30 dark:text-white/30">
                            <MdLocationOn className="text-accent text-[13px]" />
                            Ramkhamhaeng · Bang Kapi · Bangkok · Thailand
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutPage;