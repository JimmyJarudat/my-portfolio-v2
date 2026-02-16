// layout/my-layout.tsx
import { Outlet } from "react-router-dom";
import Header from "@/layout/Header";

const Layout = () => (
  <>
    <Header />
    <main className="h-full pt-24">
      <Outlet />  {/* ← children จะ render ตรงนี้ */}
    </main>
  </>
);

export default Layout;