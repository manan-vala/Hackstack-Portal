import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthCallback from './pages/AuthCallback';

// A wrapper to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">Loading...</div>;
  
  // If not logged in, force the browser to load your static HTML file
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  
  return children;
};

// Component to handle the fallback route redirect
const RedirectToLogin = () => {
  useEffect(() => {
    window.location.href = '/login.html';
  }, []);
  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth-callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-slate-950 text-white p-8">
                  <h1>Welcome to the Dashboard</h1>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route: Send unknown URLs to your HTML page */}
          <Route path="*" element={<RedirectToLogin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;