import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import LibraryBig from "lucide-react/dist/esm/icons/library-big";
import MoonStar from "lucide-react/dist/esm/icons/moon-star";
import SunMedium from "lucide-react/dist/esm/icons/sun-medium";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./applayout.css";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    caption: "Overview",
    icon: LayoutDashboard,
  },
  {
    to: "/modules",
    label: "Modules",
    caption: "Learning path",
    icon: LibraryBig,
  },
];

function getPageMeta(pathname) {
  if (pathname.startsWith("/modules/")) {
    return {
      eyebrow: "Learning workspace",
      title: "Module focus",
      description:
        "Open daily lessons, complete quizzes, and keep the final task in sight.",
    };
  }

  if (pathname.startsWith("/modules")) {
    return {
      eyebrow: "Learning workspace",
      title: "Modules",
      description:
        "Choose a stack, register instantly, and move through each day with a clear pace.",
    };
  }

  return {
    eyebrow: "Student portal",
    title: "Dashboard",
    description:
      "Track your active modules, quiz points, and how far you are from completion.",
  };
}

export function AppLayout({ children }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pageMeta = getPageMeta(location.pathname);

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-mark">
            <Sparkles size={18} />
          </div>
          <div className="portal-brand-copy">
            <strong>Hackstack</strong>
            <span>Portal</span>
          </div>
        </div>

        <nav className="portal-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, caption, icon: Icon }) => {
            const isActive =
              to === "/modules"
                ? location.pathname.startsWith("/modules")
                : location.pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={`portal-nav-link ${isActive ? "is-active" : ""}`}
              >
                <span className="portal-nav-icon">
                  <Icon size={18} />
                </span>
                <span className="portal-nav-copy">
                  <strong>{label}</strong>
                  <small>{caption}</small>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="portal-sidebar-note">
          <p>Build something real, one day at a time.</p>
        </div>
      </aside>

      <div className="portal-stage">
        <header className="portal-topbar">
          <div className="portal-topbar-copy">
            <span>{pageMeta.eyebrow}</span>
            <h1>{pageMeta.title}</h1>
            <p>{pageMeta.description}</p>
          </div>

          <div className="portal-topbar-actions">
            <button
              type="button"
              className="portal-theme-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <MoonStar size={16} />
              ) : (
                <SunMedium size={16} />
              )}
              <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
            </button>

            <div className="portal-user-pill">
              <div className="portal-user-avatar">
                {(user?.username || "s").slice(0, 1).toUpperCase()}
              </div>
              <div className="portal-user-copy">
                <strong>{user?.username || "student"}</strong>
                <span>Active learner</span>
              </div>
            </div>
          </div>
        </header>

        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}
