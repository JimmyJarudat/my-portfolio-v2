import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { MdLightMode, MdDarkMode, MdLanguage } from "react-icons/md";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const NAV_KEYS = ["home", "resume", "project", "certificate", "about"] as const;

const NAV_PATHS = {
  home: "/",
  resume: "/resume",
  project: "/project",
  certificate: "/certificate",
  about: "/about",
} as const;

const Header = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (path: string) =>
    `${path === pathname ? "text-accent border-b-2 border-accent" : ""} 
     capitalize font-medium hover:text-accent transition-all`;

  // ปุ่ม Theme
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full border border-accent/50 flex items-center justify-center text-accent hover:bg-accent hover:text-primary hover:border-accent transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <MdLightMode className="text-xl" /> : <MdDarkMode className="text-xl" />}
    </button>
  );

  // ปุ่มเปลี่ยนภาษาแบบใหม่ - มี icon และ text
  const LanguageToggle = () => (
    <button
      onClick={() => setLanguage(language === "th" ? "en" : "th")}
      className="h-10 px-4 rounded-full border border-accent/50 flex items-center justify-center gap-2 text-accent hover:bg-accent hover:text-primary hover:border-accent transition-all duration-300 font-medium"
      aria-label="Change language"
    >
      <MdLanguage className="text-lg" />
      <span className="text-sm font-semibold">{language.toUpperCase()}</span>
    </button>
  );

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-30 text-white transition-all duration-300
      ${scrolled
        ? "py-4 bg-primary/90 backdrop-blur-md shadow-lg shadow-black/20"
        : "py-8 xl:py-12 bg-transparent"}
    `}>
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/">
          <h1 className="text-4xl font-semibold">
            Jimmy<span className="text-accent">.</span>
          </h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden xl:flex items-center gap-8">
          <nav className="flex gap-8">
            {NAV_KEYS.map((key) => (
              <Link key={key} to={NAV_PATHS[key]} className={linkClass(NAV_PATHS[key])}>
                {t.navbar[key]}
              </Link>
            ))}
          </nav>

          {/* Blog Button */}
          <Link to="/myblog">
            <button className="inline-flex items-center justify-center h-[44px] px-6 rounded-full font-semibold bg-accent text-primary hover:bg-accent-hover transition-colors">
              {t.navbar.blog}
            </button>
          </Link>

          {/* Settings Group: Language + Theme */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="xl:hidden flex items-center gap-3">
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          
          <div className="w-px h-8 bg-white/20"></div>
          
          <button onClick={() => setOpen(true)} className="flex justify-center items-center">
            <CiMenuFries className="text-[32px] text-accent" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
              <div className="fixed top-0 right-0 h-full w-[75vw] max-w-sm bg-primary z-50 flex flex-col p-6 shadow-xl">
                <button onClick={() => setOpen(false)} className="self-end text-2xl text-white hover:text-accent mb-4">
                  ✕
                </button>
                <div className="mt-32 mb-40 text-center">
                  <Link to="/" onClick={() => setOpen(false)}>
                    <h1 className="text-4xl font-semibold">
                      Jimmy<span className="text-accent">.</span>
                    </h1>
                  </Link>
                </div>
                <nav className="flex flex-col justify-center items-center gap-8">
                  {NAV_KEYS.map((key) => (
                    <Link 
                      key={key} 
                      to={NAV_PATHS[key]} 
                      onClick={() => setOpen(false)} 
                      className={linkClass(NAV_PATHS[key])}
                    >
                      {t.navbar[key]}
                    </Link>
                  ))}
                  
                  {/* Blog Link in Mobile Menu */}
                  <Link to="/myblog" onClick={() => setOpen(false)}>
                    <button className="inline-flex items-center justify-center h-[44px] px-8 rounded-full font-semibold bg-accent text-primary hover:bg-accent-hover transition-colors mt-4">
                      {t.navbar.blog}
                    </button>
                  </Link>
                </nav>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;