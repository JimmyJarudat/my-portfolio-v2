import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layout/my-laout";
import App from "@/App";

// เพิ่มหน้าอื่นตรงนี้ได้เลย
const router = createBrowserRouter([
  { 
    path: "/",
    element: < Layout/>,
    children: [
      { index: true, element: <App /> },
    ],
  },
]);

export default router;