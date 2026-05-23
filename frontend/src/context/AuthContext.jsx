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

  const logout = async () => {
    // Clear the HttpOnly cookie on the server side first
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const userData = await authService.getCurrentUser();
    setUser(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

