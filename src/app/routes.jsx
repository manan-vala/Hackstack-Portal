import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ModuleCatalog } from "./pages/ModuleCatalog";
import { ModuleDetail } from "./pages/ModuleDetail";
const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/modules" replace /> },
      { path: "/modules", Component: ModuleCatalog },
      { path: "/modules/:slug", Component: ModuleDetail }
    ]
  },
  { path: "*", element: <Navigate to="/modules" replace /> }
]);
export {
  router
};
