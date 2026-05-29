import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DashboardHero } from "../components/dashboard/DashboardHero";
import { ModuleProgressCard } from "../components/dashboard/ModuleProgressCard";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { TimelineCalendar } from "../components/dashboard/TimelineCalendar";
import { dashboardService } from "../services/dashboardService";

function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Dismissed IDs are kept in memory only — they reset on reload so
  // any notification still active on the server reappears automatically.
  // Notifications the admin has removed won't come back (API won't return them).
  const [dismissedIds, setDismissedIds] = useState([]);

  // One-time cleanup: remove the legacy key that permanently hid notifications.
  useEffect(() => {
    localStorage.removeItem("dismissed_notifications");
  }, []);

  const notifications = (dashboard?.notifications || []).filter(
    (n) => !dismissedIds.includes(n._id)
  );

  const handleDismissNotification = (id) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await dashboardService.getDashboard();

        if (!isActive) return;
        setDashboard(data);
      } catch (err) {
        if (!isActive) return;
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [user]);

  const summary = dashboard?.summary || {
    registeredModules: 0,
    completedModules: 0,
    averageCompletion: 0,
    totalQuizScore: 0,
    totalQuizAttempts: 0,
    totalQuizzes: 0,
    completedDays: 0,
    totalDays: 0,
  };

  const moduleRows = dashboard?.modules || [];

  if (loading) {
    return (
      <div className="dashboard-shell">
        <div className="dashboard-loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <DashboardHero
        username={dashboard?.user?.username || user?.username || "student"}
        summary={summary}
      />

      {error ? (
        <div className="dashboard-alert dashboard-alert-error">{error}</div>
      ) : null}

      {notifications.length > 0 && (
        <div className="dashboard-notifications-container">
          {notifications.map((notif) => (
            <div key={notif._id} className="dashboard-notification-banner">
              <div className="dashboard-notification-icon">
                <Bell size={18} />
              </div>
              <div className="dashboard-notification-content">
                {notif.content}
              </div>
              <button
                onClick={() => handleDismissNotification(notif._id)}
                className="dashboard-notification-dismiss"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <DashboardStats summary={summary} />

      <TimelineCalendar />

      <section id="dashboard-modules" className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Module progress</h2>
            <p>
              Keep an eye on each stack, how many quiz checkpoints you have
              cleared, and which module needs your attention next.
            </p>
          </div>
          <div className="dashboard-section-chip">
            {summary.totalDays} learning days tracked
          </div>
        </div>

        <div className="dashboard-grid">
          {moduleRows.length > 0 ? (
            moduleRows.map((row, index) => (
              <ModuleProgressCard key={row.id || row._id} row={row} index={index} />
            ))
          ) : (
            <div className="dashboard-empty">
              No registered modules yet. Head to the modules page and start your
              first stack.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
