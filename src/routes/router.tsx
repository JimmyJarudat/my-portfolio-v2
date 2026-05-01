import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/my-layout";
import App from "@/App";

import ProjectPage    from "@/pages/project";
import AboutPage      from "@/pages/about";
import ResumePage     from "@/pages/resume";
import TechNotePage   from "@/pages/tech-note";
import GuidesPage     from "@/pages/guides";
import AdminLoginPage from "@/pages/auth/login";
import AdminPage      from "@/pages/admin";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNotePage  from "@/pages/admin/AdminNotesPage";
import AdminNoteEditPage  from "@/pages/admin/AdminNoteEditPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
    ],
  },
  {
    path: "/project",
    element: <Layout />,
    children: [
      { index: true, element: <ProjectPage /> },
    ],
  },
  {
    path: "/about",
    element: <Layout />,
    children: [
      { index: true, element: <AboutPage /> },
    ],
  },
  {
    path: "/resume",
    element: <Layout />,
    children: [
      { index: true, element: <ResumePage /> },
    ],
  },
  {
    path: "/tech-note",
    element: <Layout />,
    children: [
      { index: true, element: <TechNotePage /> },
    ],
  },

  {
    path: "/guides",
    element: <Layout />,
    children: [
      { index: true, element: <GuidesPage /> },
    ],
  },

  // ── Admin: login page (no layout, no auth guard) ──
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },

  // ── Admin: protected pages (ต้อง login ก่อน) ──
  {
    path: "/admin",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <AdminPage /> },
      { path: "notes", element: <AdminNotePage /> },
      { path: "notes/new", element: <AdminNoteEditPage /> },
      { path: "notes/:id/edit", element: <AdminNoteEditPage /> },
    ],
  },
]);

export default router;