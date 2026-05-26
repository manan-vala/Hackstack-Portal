import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import LibraryBig from "lucide-react/dist/esm/icons/library-big";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProfileModal } from "./ProfileModal";
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
  {
    to: "/leaderboard",
    label: "Leaderboard",
    caption: "Standings",
    icon: Trophy,
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

  if (pathname.startsWith("/leaderboard")) {
    return {
      eyebrow: "Community standings",
      title: "Leaderboard",
      description:
        "Check how you rank globally and across individual modules.",
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const pageMeta = getPageMeta(location.pathname);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-mark">
            <img
              src={`${import.meta.env.BASE_URL}swc-logo.webp`}
              alt="Hackstack logo"
              width={22}
              height={22}
            />
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
              className="portal-logout-button"
              onClick={logout}
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

            <button
              type="button"
              className="portal-user-pill"
              onClick={() => setIsProfileOpen(true)}
              aria-label="View profile details"
            >
              <div className="portal-user-avatar">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username || "Avatar"}
                    style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }}
                  />
                ) : (
                  (user?.username || "s").slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="portal-user-copy">
                <strong>{user?.username || "student"}</strong>
                <span>Active learner</span>
              </div>
            </button>
          </div>
        </header>

        <main className="portal-main">{children}</main>
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
    </div>
  );
}
