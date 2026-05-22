import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModulesProvider } from './context/ModulesContext';
import { AppLayout } from './components/AppLayout';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import ModuleCatalog from './pages/ModuleCatalog';
import ModuleDetail from './pages/ModuleDetail';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login.html';
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth-callback" element={<AuthCallback />} />

          <Route path="/dashboard" element={<ProtectedApp><Dashboard /></ProtectedApp>} />
          <Route path="/modules" element={<ProtectedApp><ModuleCatalog /></ProtectedApp>} />
          <Route path="/modules/:slug" element={<ProtectedApp><ModuleDetail /></ProtectedApp>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
