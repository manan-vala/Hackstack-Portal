// src/App.jsx
// Shows where to plug in the admin routes alongside your existing routes.
// Copy the admin section into your actual App.jsx.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Existing pages (your team's work) ────────────────────────────────────────
// import Login          from "./pages/Login";
// import Dashboard      from "./pages/Dashboard";
// import ModuleCatalog  from "./pages/ModuleCatalog";
// import CoursePage     from "./pages/CoursePage";
// import QuizPage       from "./pages/QuizPage";
import Leaderboard    from "./pages/Leaderboard";          // ← already delivered

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminLogin      from "./pages/admin/AdminLogin";
import AdminDashboard  from "./pages/admin/AdminDashboard";
import CreateModule    from "./pages/admin/CreateModule";
import EditModule      from "./pages/admin/EditModule";

// ── Guards ────────────────────────────────────────────────────────────────────
// import ProtectedRoute      from "./components/ProtectedRoute";       // your existing JWT guard
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

// ── Context ───────────────────────────────────────────────────────────────────
import { AdminAuthProvider } from "./context/AdminAuthContext";

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── User-facing routes (your team wires these) ─────────────── */}
          {/* <Route path="/login"        element={<Login />} /> */}
          {/* <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
          {/* <Route path="/modules"      element={<ProtectedRoute><ModuleCatalog /></ProtectedRoute>} /> */}
          {/* <Route path="/course/:slug" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} /> */}
          {/* <Route path="/quiz/:moduleId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} /> */}
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* ── Admin routes ────────────────────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/modules/create"
            element={
              <AdminProtectedRoute>
                <CreateModule />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/modules/edit"
            element={
              <AdminProtectedRoute>
                <EditModule />
              </AdminProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/leaderboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
