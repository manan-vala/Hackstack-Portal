// AdminAuthContext
// Manages admin session state.
// Admin auth is entirely credential-based (username + password against env vars).
// On login, stores JWT in localStorage. No GitHub OAuth, no MongoDB User record.

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

  // Auto-logout when the admin tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear admin session when the tab is closed
      localStorage.removeItem("jwt");
      localStorage.removeItem("adminUser");
    };

    const handlePageHide = () => {
      // Additional handler for mobile/browser tab switching
      localStorage.removeItem("jwt");
      localStorage.removeItem("adminUser");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

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
