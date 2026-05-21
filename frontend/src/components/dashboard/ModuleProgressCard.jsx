import './dashboard.css';

export function ModuleProgressCard({ row, index = 0 }) {
  const { id, title, description, difficulty, totalDays, completedDays, completionPercent, totalQuizzes, attemptedQuizzes, quizProgressPercent, quizScore, totalQuizScore, progressUpdatedAt, quizResults = [] } = row;

  return <article className="module-card" data-tone={index % 4}>
      <div className="module-card-top">
        <div>
          <p className="module-tag">{difficulty || 'Module'}</p>
          <h3>{title}</h3>
          <p className="module-description">{description}</p>
        </div>
        <div className="module-badge">{completionPercent}%</div>
      </div>

      <div className="module-meta-row">
        <span>{totalDays} learning days</span>
        <span>{attemptedQuizzes}/{totalQuizzes} quizzes</span>
        <span>{progressUpdatedAt ? 'Recently updated' : 'Awaiting first sync'}</span>
      </div>

      <div className="module-progress-line">
        <span style={{ width: `${completionPercent}%` }} />
      </div>

      <div className="module-grid">
        <MiniStat label="Quiz progress" value={`${attemptedQuizzes}/${totalQuizzes}`} detail={`${quizProgressPercent}% complete`} />
        <MiniStat label="Quiz score" value={quizScore} detail={totalQuizScore ? `out of ${totalQuizScore}` : 'points earned'} />
        <MiniStat label="Module progress" value={`${completedDays}/${totalDays}`} detail={`${completionPercent}% complete`} />
      </div>

      <div className="module-quiz-results">
        <div className="module-quiz-results-header">
          <span>Quiz results</span>
          <strong>{quizResults.length}</strong>
        </div>
        <div className="module-quiz-results-list">
          {quizResults.length > 0 ? quizResults.map((quiz) => <QuizResultItem key={quiz.id} quiz={quiz} />) : <div className="module-quiz-empty">No quizzes available for this module.</div>}
        </div>
      </div>

      <div className="module-footer">
        <div className="module-footnote">
          <span>Completion is calculated from completed learning days.</span>
          <span>{progressUpdatedAt ? `Synced ${new Date(progressUpdatedAt).toLocaleDateString()}` : 'No sync yet'}</span>
        </div>
        <div className="module-score-pill">{quizScore} points earned</div>
      </div>
    </article>;
}

function MiniStat({ label, value, detail }) {
  return <div className="module-mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>;
}

function QuizResultItem({ quiz }) {
  return <div className={`quiz-result-item ${quiz.attempted ? 'is-complete' : 'is-pending'}`}>
      <div>
        <span className="quiz-result-label">{quiz.label}</span>
        <strong>{quiz.attempted ? `${quiz.score}/${quiz.maxScore} pts` : 'Not attempted'}</strong>
      </div>
      <div className="quiz-result-meta">
        <span>{quiz.questionCount} questions</span>
        <span>{quiz.attempted ? `${quiz.percentage}%` : '--'}</span>
      </div>
    </div>;
}