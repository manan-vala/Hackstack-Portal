import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModulesProvider } from "./context/ModulesContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppLayout } from "./components/AppLayout";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ModuleCatalog from "./pages/ModuleCatalog";
import ModuleDetail from "./pages/ModuleDetail";

import { AdminAuthProvider } from "../adminportal/admin-auth-context";
import AdminProtectedRoute from "../adminportal/admin-protected-route";
import AdminLogin from "../adminportal/admin-login";
import AdminDashboard from "../adminportal/admin-dashboard";
import CreateModule from "../adminportal/create-module";
import EditModule from "../adminportal/edit-module";
import DeleteModule from "../adminportal/delete-module";
import Leaderboard from "../adminportal/leaderboard";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.assign("/login.html");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};

const ProtectedApp = ({ children }) => (
  <ProtectedRoute>
    <ModulesProvider>
      <AppLayout>{children}</AppLayout>
    </ModulesProvider>
  </ProtectedRoute>
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth-callback" element={<AuthCallback />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedApp>
                    <Dashboard />
                  </ProtectedApp>
                }
              />
              <Route
                path="/modules"
                element={
                  <ProtectedApp>
                    <ModuleCatalog />
                  </ProtectedApp>
                }
              />
              <Route
                path="/modules/:slug"
                element={
                  <ProtectedApp>
                    <ModuleDetail />
                  </ProtectedApp>
                }
              />

              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
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
                path="/admin/modules/delete"
                element={
                  <AdminProtectedRoute>
                    <DeleteModule />
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
                path="/admin/leaderboard"
                element={
                  <AdminProtectedRoute>
                    <Leaderboard />
                  </AdminProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
