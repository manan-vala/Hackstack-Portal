import { ArrowUpRight, BarChart3, CircleCheckBig, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { getModuleTheme } from "../../utils/moduleAdapter";
import "./dashboard.css";

export function ModuleProgressCard({ row, index = 0 }) {
  const {
    slug,
    title,
    description,
    difficulty,
    totalDays,
    completedDays,
    completionPercent,
    totalQuizzes,
    attemptedQuizzes,
    quizProgressPercent,
    quizScore,
    totalQuizScore,
    progressUpdatedAt,
  } = row;

  const moduleTheme = getModuleTheme(slug);
  const lastSynced = progressUpdatedAt
    ? new Date(progressUpdatedAt).toLocaleDateString()
    : "Awaiting first sync";

  return (
    <article className="dashboard-module-card">
      <div
        className="dashboard-module-card-top"
        style={{
          background: `${moduleTheme.banner}, radial-gradient(circle at top right, ${moduleTheme.dot} 1px, transparent 1px)`,
          backgroundSize: "auto, 14px 14px",
          boxShadow: `0 20px 45px ${moduleTheme.bannerShadow}`,
        }}
      >
        <div>
          <span className="dashboard-module-label">
            Module {index + 1} · {difficulty || "Guided track"}
          </span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="dashboard-module-badge">{completionPercent}%</div>
      </div>

      <div className="dashboard-module-card-body">
        <div className="dashboard-module-meta">
          <span>{completedDays}/{totalDays} days done</span>
          <span>{attemptedQuizzes}/{totalQuizzes} quizzes</span>
          <span>{lastSynced}</span>
        </div>

        <div className="dashboard-module-progress">
          <div style={{ width: `${completionPercent}%`, background: moduleTheme.button }} />
        </div>

        <div className="dashboard-module-stats">
          <MiniStat
            icon={<CircleCheckBig size={15} />}
            label="Module progress"
            value={`${completedDays}/${totalDays}`}
            detail={`${completionPercent}% complete`}
          />
          <MiniStat
            icon={<BarChart3 size={15} />}
            label="Quiz progress"
            value={`${attemptedQuizzes}/${totalQuizzes}`}
            detail={`${quizProgressPercent}% attempted`}
          />
          <MiniStat
            icon={<Target size={15} />}
            label="Score"
            value={quizScore}
            detail={totalQuizScore ? `out of ${totalQuizScore}` : "No score yet"}
          />
        </div>

        <div className="dashboard-module-footer">
          <div>
            <strong>Next step</strong>
            <p>
              {completionPercent === 100
                ? "This module is finished. Review the final task or polish your submission."
                : "Jump back into the next available day and keep your streak moving."}
            </p>
          </div>
          {slug ? (
            <Link to={`/modules/${slug}`} className="dashboard-module-link">
              Open module
              <ArrowUpRight size={16} />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MiniStat({ icon, label, value, detail }) {
  return (
    <div className="dashboard-mini-stat">
      <div className="dashboard-mini-stat-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
