import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaGithub, FaFacebook, FaYoutube, FaLine } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── ข้อมูล ──────────────────────────────────────────────
const PHOTO_PATH = "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/Hero_Jimmy.png";
const CV_PATH    = "/pdf/CV.pdf";
const CV_NAME    = "CV-Jimmy.pdf";

const SOCIALS = [
  { icon: <FaGithub />,   path: "https://github.com/JimmyJarudat" },
  { icon: <FaFacebook />, path: "https://www.facebook.com/profile.php?id=100009567887215" },
  { icon: <FaLine />,     path: "https://line.me/ti/p/gac1BG3G2r" },
];
// ────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const STATS = [
    { num: 1,  text: t.home.stats.yearsExperience },
    { num: 2,  text: t.home.stats.projectsCompleted },
    { num: 8,  text: t.home.stats.technologiesMastered },
  ];

  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    const timeout = setTimeout(() => {
      const steps = 60;
      const interval = (5 * 1000) / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        setCounts(STATS.map((s) => (step >= steps ? s.num : Math.floor((s.num / steps) * step))));
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="h-full w-full">
      <div className="container mx-auto h-full">
        <div className="flex flex-col xl:flex-row items-center justify-between xl:pt-8 xl:pb-24">

          {/* ─── Text ─── */}
          <div className="text-center xl:text-left order-2 xl:order-none">
            <span className="text-xl" style={{ color: "var(--text-muted)" }}>
              {t.home.subtitle}
            </span>
            <h1 className="h1 mb-6" style={{ color: "var(--text)" }}>
              {t.home.greeting} <br />
              <span className="text-accent">{t.home.name}</span>
            </h1>
            <p className="max-w-[500px] mb-9" style={{ color: "var(--text-muted)" }}>
              {t.home.description}
            </p>

            <div className="flex flex-col xl:flex-row items-center gap-8">
              {/* Download CV */}
              <a href={CV_PATH} download={CV_NAME}>
                <button className="inline-flex items-center justify-center gap-2 h-[56px] px-8 text-sm font-semibold uppercase tracking-[2px] rounded-full border border-accent bg-transparent text-accent hover:bg-accent hover:text-primary transition-colors">
                  <span>{t.home.downloadCV}</span>
                  <FiDownload className="text-xl" />
                </button>
              </a>

              {/* Social Icons */}
              <div className="flex gap-6 mb-8 xl:mb-0">
                {SOCIALS.map((s, i) => (
                  <a key={i} href={s.path} target="_blank" rel="noreferrer"
                    className="w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent text-base hover:bg-accent hover:text-primary transition-all duration-500">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Photo ─── */}
          <div className="order-1 xl:order-none mb-8 xl:mb-0">
            <div className="w-full h-full relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 2, duration: 0.4, ease: "easeIn" } }}
              >
                {/* mix-blend เปลี่ยนตาม theme */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 2, duration: 0.4, ease: "easeInOut" } }}
                  className={`w-[298px] h-[298px] xl:w-[498px] xl:h-[498px] absolute
                    ${isDark ? "mix-blend-lighten" : "mix-blend-multiply"}`}
                >
                  <img src={PHOTO_PATH} alt="" className="object-contain w-full h-full" />
                </motion.div>

                {/* วงกลม accent เปลี่ยนสีตาม theme */}
                <motion.svg
                  className="w-[300px] xl:w-[506px] xl:h-[506px]"
                  fill="transparent" viewBox="0 0 506 506"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.circle
                    cx="253" cy="253" r="250"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ strokeDasharray: "24 10 0 0" }}
                    animate={{
                      strokeDasharray: ["15 120 25 25", "16 25 92 172", "4 250 22 22"],
                      rotate: [120, 360],
                    }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                  />
                </motion.svg>
              </motion.div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Stats ─── */}
      <section>
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-6 max-w-[80vw] mx-auto xl:max-w-none">
            {STATS.map((item, i) => (
              <div key={i} className="flex-1 flex gap-4 items-center justify-center xl:justify-start">
                <span className="text-4xl xl:text-6xl font-extrabold" style={{ color: "var(--text)" }}>
                  {counts[i]}
                </span>
                <p className={`${item.text.length < 15 ? "max-w-[100px]" : "max-w-[150px]"} leading-snug`}
                  style={{ color: "var(--text-muted)" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </section>
  );
};

export default Home;