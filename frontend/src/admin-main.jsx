import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import "./index.css";
import { AdminApp } from "./App.jsx";
import { AdminAuthProvider } from "../adminportal/admin-auth-context";

// Ensure dark mode settings are active for admin portal
document.documentElement.dataset.theme = "dark";
document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme = "dark";

createRoot(document.getElementById("admin-root")).render(
  <StrictMode>
    <AdminAuthProvider>
      <AdminApp />
    </AdminAuthProvider>
  </StrictMode>
);
