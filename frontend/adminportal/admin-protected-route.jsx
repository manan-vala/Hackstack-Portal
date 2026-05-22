// src/components/admin/AdminProtectedRoute.jsx
// Wraps any admin page. Redirects to /admin/login if not authenticated.
// Uses isAdmin flag from the JWT payload (set by your backend).

import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-gray-400 text-sm animate-pulse">Verifying access…</span>
      </div>
    );
  }

  if (!admin || !admin.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
