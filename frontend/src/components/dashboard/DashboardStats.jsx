import './dashboard.css';

export function DashboardStats({ summary }) {
  return <section className="dashboard-stats">
      <StatCard label="Quiz progress" value={`${summary.totalQuizAttempts}/${summary.totalQuizzes}`} description="Quizzes attempted over total available quizzes" tone="cyan" />
      <StatCard label="Module progress" value={`${summary.averageCompletion}%`} description="Average module completion across enrolled modules" tone="indigo" />
      <StatCard label="Quiz score" value={summary.totalQuizScore} description="Total score accumulated from quiz submissions" tone="amber" />
      <StatCard label="Module complete" value={`${summary.completedModules}/${summary.registeredModules}`} description="Fully completed modules over registered modules" tone="emerald" />
    </section>;
}

function StatCard({ label, value, description, tone }) {
  return <article className={`dashboard-stat-card dashboard-stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </article>;
}