import { createContext, useContext, useEffect, useMemo } from "react";

const ThemeContext = createContext(null);

// Brand palette is always light — no dark mode.
function applyTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = "light";
  root.classList.remove("dark");
  root.style.colorScheme = "light";
}

export function ThemeProvider({ children }) {
  useEffect(() => {
    applyTheme();
    // Clear any previously stored dark preference
    window.localStorage.removeItem("hackstack-theme");
  }, []);

  const value = useMemo(
    () => ({
      theme: "light",
      isDark: false,
      setTheme: () => {},
      toggleTheme: () => {},
    }),
    []
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
