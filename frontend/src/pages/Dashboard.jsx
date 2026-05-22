import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardHero } from "../components/dashboard/DashboardHero";
import { ModuleProgressCard } from "../components/dashboard/ModuleProgressCard";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { dashboardService } from "../services/dashboardService";

function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      <DashboardStats summary={summary} />

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
