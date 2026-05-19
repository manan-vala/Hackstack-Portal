import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Fetch user from API - token is in HttpOnly cookie (automatically sent)
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = (_, userData) => {
    // Token is stored in HttpOnly cookie, only store user data
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Cookie will be cleared by backend logout endpoint
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
