import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/my-layout";
import App from "@/App";

import ProjectPage from "@/pages/project";
import AboutPage from "@/pages/about";
import ResumePage from "@/pages/resume";
import TechNotePage from "@/pages/tech-note";

// เพิ่มหน้าอื่นตรงนี้ได้เลย
const router = createBrowserRouter([
  {
    path: "/",
    element: < Layout />,
    children: [
      { index: true, element: <App /> },
    ],
  },

  {
    path: "/project",
    element: < Layout />,
    children: [
      { index: true, element: <ProjectPage /> },
    ],
  },

  {
    path: "/about",
    element: < Layout />,
    children: [
      { index: true, element: <AboutPage /> },
    ],
  },

  {
    path: "/resume",
    element: < Layout />,
    children: [
      { index: true, element: <ResumePage /> },
    ],
  },

  {
    path: "/tech-note",
    element: < Layout />,
    children: [
      { index: true, element: <TechNotePage /> },
    ],
  },


]);

export default router;