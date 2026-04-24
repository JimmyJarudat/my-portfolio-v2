// layout/my-layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/layout/Header";

const Layout = () => {
  const location = useLocation();

  return (
    <>
      <Header />
      <main className="h-full pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
};

export default Layout;