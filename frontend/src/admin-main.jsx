import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import "./index.css";
import AdminApp from "../adminportal/app.jsx";
import { AdminAuthProvider } from "../adminportal/admin-auth-context";

createRoot(document.getElementById("admin-root")).render(
  <StrictMode>
    <AdminAuthProvider>
      <AdminApp />
    </AdminAuthProvider>
  </StrictMode>
);
