import "./dashboard.css";

export function DashboardStats({ summary }) {
  const quizPercent =
    summary.totalQuizzes > 0
      ? Math.round((summary.totalQuizAttempts / summary.totalQuizzes) * 100)
      : 0;
  const dayPercent =
    summary.totalDays > 0
      ? Math.round((summary.completedDays / summary.totalDays) * 100)
      : 0;
  const completionShare =
    summary.registeredModules > 0
      ? Math.round((summary.completedModules / summary.registeredModules) * 100)
      : 0;

  return (
    <section className="dashboard-stats">
      <StatCard
        label="Quiz progress"
        value={`${summary.totalQuizAttempts}/${summary.totalQuizzes}`}
        detail={`${quizPercent}% of available quizzes attempted`}
        progress={quizPercent}
      />
      <StatCard
        label="Learning days"
        value={`${summary.completedDays}/${summary.totalDays}`}
        detail={`${dayPercent}% of tracked days complete`}
        progress={dayPercent}
      />
      <StatCard
        label="Quiz score"
        value={summary.totalQuizScore}
        detail="Points earned across your submitted quizzes"
        progress={Math.min(summary.totalQuizScore, 100)}
      />
      <StatCard
        label="Module completion"
        value={`${summary.completedModules}/${summary.registeredModules}`}
        detail={`${completionShare}% of enrolled modules wrapped up`}
        progress={completionShare}
      />
    </section>
  );
}

function StatCard({ label, value, detail, progress }) {
  return (
    <article className="dashboard-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
      <div className="dashboard-stat-progress">
        <div style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </article>
  );
}
