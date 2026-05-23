// Admin standalone application
// Access at /admin.html in production or admin routes when served separately

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminLogin from "./admin-login";
import AdminDashboard from "./admin-dashboard";
import CreateModule from "./create-module";
import EditModule from "./edit-module";
import DeleteModule from "./delete-module";
import Leaderboard from "./leaderboard";

// ── Guard ────────────────────────────────────────────────────────────────────
import AdminProtectedRoute from "./admin-protected-route";

export default function AdminApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin routes ────────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
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
        <Route
          path="/admin/modules/edit/:id"
          element={
            <AdminProtectedRoute>
              <EditModule />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/modules/delete"
          element={
            <AdminProtectedRoute>
              <DeleteModule />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/leaderboard"
          element={
            <AdminProtectedRoute>
              <Leaderboard />
            </AdminProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
