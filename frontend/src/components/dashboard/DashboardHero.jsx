import './dashboard.css';

export function DashboardHero({ username, summary }) {
  return <header className="dashboard-hero">
      <div className="dashboard-orb dashboard-orb-a" />
      <div className="dashboard-orb dashboard-orb-b" />
      <div className="dashboard-hero-copy">
        <p className="dashboard-kicker">Learning dashboard</p>
        <h1 className="dashboard-title">Welcome back, {username}</h1>
        <p className="dashboard-hero-text">Track quiz progress, module progress, quiz score, and how much of each module is complete.</p>
        <div className="dashboard-hero-chips">
          <span>{summary.registeredModules} modules enrolled</span>
          <span>{summary.completedModules} completed</span>
          <span>{summary.totalDays} learning days</span>
        </div>
      </div>

      <div className="dashboard-hero-metrics">
        <HeroMetric label="Registered modules" value={summary.registeredModules} />
        <HeroMetric label="Modules complete" value={summary.completedModules} />
        <HeroMetric label="Quiz score" value={summary.totalQuizScore} />
        <HeroMetric label="Avg. complete" value={`${summary.averageCompletion}%`} />
      </div>
    </header>;
}

function HeroMetric({ label, value }) {
  return <div className="dashboard-hero-metric">
      <div className="dashboard-metric-label">{label}</div>
      <strong className="dashboard-metric-value">{value}</strong>
    </div>;
}