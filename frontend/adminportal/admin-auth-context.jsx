// src/context/AdminAuthContext.jsx
// Manages admin session state.
// On login, stores JWT in localStorage and sets isAdmin flag.
// This works with your existing JWT + isAdmin field in the Users collection.

import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]       = useState(null);   // { username, avatarUrl, isAdmin }
  const [loading, setLoading]   = useState(true);   // checking localStorage on mount

  // On app load, restore session if JWT exists
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const user  = localStorage.getItem("adminUser");
    if (token && user) {
      try {
        setAdmin(JSON.parse(user));
      } catch {
        localStorage.removeItem("adminUser");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("jwt", token);
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setAdmin(userData);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("adminUser");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
