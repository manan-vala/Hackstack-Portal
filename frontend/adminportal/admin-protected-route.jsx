// AdminProtectedRoute
// Wraps any admin page. Redirects to /admin/login if not authenticated.
// Admin auth is purely credential-based (username + password) — no GitHub, no isAdmin DB flag.

import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./admin-auth-context";

export default function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-gray-400 text-sm animate-pulse">
          Verifying access…
        </span>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
