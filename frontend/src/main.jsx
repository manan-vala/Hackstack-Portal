import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import "./index.css";
import App from "./App.jsx";

// Import your providers here
import { AuthProvider } from "./context/AuthContext";
import { ModulesProvider } from "./context/ModulesContext";
import { StoreProvider } from "./store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ModulesProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ModulesProvider>
    </AuthProvider>
  </StrictMode>,
);
