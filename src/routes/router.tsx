import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/my-layout";
import App from "@/App";

import ProjectPage from "@/pages/project";

// เพิ่มหน้าอื่นตรงนี้ได้เลย
const router = createBrowserRouter([
  { 
    path: "/",
    element: < Layout/>,
    children: [
      { index: true, element: <App /> },
    ],
  },

  { 
    path: "/project",
    element: < Layout/>,
    children: [
      { index: true, element: <ProjectPage /> },
    ],
  },
]);

export default router;