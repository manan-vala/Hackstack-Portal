import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModulesProvider } from "./context/ModulesContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppLayout } from "./components/AppLayout";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ModuleCatalog from "./pages/ModuleCatalog";
import ModuleDetail from "./pages/ModuleDetail";
import Leaderboard from "./pages/Leaderboard";
import Onboarding from "./pages/Onboarding";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      window.location.assign(`/hackstack/login.html`);
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user && !user.profileCompleted) {
      navigate('/onboarding');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!user || !user.profileCompleted) {
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
        <Router basename="/hackstack">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<Onboarding />} />

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
              path="/leaderboard"
              element={
                <ProtectedApp>
                  <Leaderboard />
                </ProtectedApp>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
