import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useModules } from '../context/ModulesContext';
import './modules.css';

function ModuleDetail() {
  const { slug } = useParams();
  const {
    modules,
    loading,
    error,
    registeredModuleIds,
    getProgressForModule,
    getQuizzesForModule,
    completeDay,
    submitQuiz,
  } = useModules();

  const module = useMemo(
    () => modules.find((entry) => entry.slug === slug),
    [modules, slug]
  );

  const [openDay, setOpenDay] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [quizError, setQuizError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="modules-shell">Loading module...</div>;
  }

  if (!module) {
    return (
      <div className="modules-shell">
        <p>Module not found.</p>
        <Link to="/modules" className="module-detail-back">
          Back to modules
        </Link>
      </div>
    );
  }

  const isRegistered = registeredModuleIds.includes(module.id);
  const progress = getProgressForModule(module.id);
  const completedSet = new Set(
    (progress?.completedDays || []).map((id) => id.toString())
  );
  const moduleQuizzes = getQuizzesForModule(module.id);
  const quizByDayId = new Map(
    moduleQuizzes.map((quiz) => [quiz.dayId?.toString(), quiz])
  );

  const handleCompleteDay = async (day) => {
    if (!isRegistered) return;

    try {
      await completeDay(module.id, day.id);
    } catch (err) {
      setQuizError(err.message);
    }
  };

  const handleSubmitQuiz = async (quiz) => {
    if (!quiz || answers.length !== quiz.questions.length) return;

    setSubmitting(true);
    setQuizError('');

    try {
      await submitQuiz(quiz._id, answers);
      await handleCompleteDay(openDay);
      setAnswers([]);
    } catch (err) {
      setQuizError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openDayQuiz = openDay ? quizByDayId.get(openDay.id) : null;

  return (
    <div className="modules-shell">
      <Link to="/modules" className="module-detail-back">
        ← All modules
      </Link>

      <header className="module-detail-hero">
        <h1>{module.title}</h1>
        <p>{module.description}</p>
        <div className="module-meta">
          <span>{module.dayCount} days</span>
          <span>{completedSet.size}/{module.dayCount} completed</span>
        </div>
      </header>

      {error ? <div className="modules-alert">{error}</div> : null}
      {quizError ? <div className="modules-alert">{quizError}</div> : null}

      {!isRegistered ? (
        <div className="module-warning">
          You are not enrolled in this module. Go back to the catalog to register first.
        </div>
      ) : null}

      <h2>Daily lessons</h2>
      <div className="module-days-grid">
        {module.days.map((day, index) => {
          const done = completedSet.has(day.id);
          const previousDay = module.days[index - 1];
          const locked =
            !isRegistered ||
            (index > 0 && !completedSet.has(previousDay?.id?.toString()));

          return (
            <button
              key={day.id}
              type="button"
              className={`module-day-card ${done ? 'is-done' : ''} ${locked ? 'is-locked' : ''}`}
              disabled={locked}
              onClick={() => {
                setOpenDay(day);
                setAnswers([]);
                setQuizError('');
              }}
            >
              <span>Day {day.day}</span>
              <h3>{day.title}</h3>
              <p>{day.chapterTitle}</p>
              {quizByDayId.has(day.id) ? <span>Includes quiz</span> : null}
            </button>
          );
        })}
      </div>

      {openDay ? (
        <div className="module-day-modal" onClick={() => setOpenDay(null)}>
          <div
            className="module-day-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>
              Day {openDay.day}: {openDay.title}
            </h2>
            <div className="module-markdown">
              <ReactMarkdown>{openDay.contentMarkdown}</ReactMarkdown>
            </div>

            {openDay.videoUrl ? (
              <p>
                <a href={openDay.videoUrl} target="_blank" rel="noreferrer">
                  Watch video
                </a>
              </p>
            ) : null}

            {openDayQuiz ? (
              <div className="module-quiz-block">
                <h3>Day quiz</h3>
                {openDayQuiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="module-quiz-question">
                    <p>{question.question}</p>
                    <div className="module-quiz-options">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          type="button"
                          className={
                            answers[questionIndex] === optionIndex ? 'is-selected' : ''
                          }
                          onClick={() => {
                            const next = [...answers];
                            next[questionIndex] = optionIndex;
                            setAnswers(next);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="module-btn module-btn-primary"
                  disabled={submitting || answers.length !== openDayQuiz.questions.length}
                  onClick={() => handleSubmitQuiz(openDayQuiz)}
                >
                  Submit quiz
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="module-btn module-btn-primary"
                disabled={!isRegistered || completedSet.has(openDay.id)}
                onClick={() => handleCompleteDay(openDay)}
              >
                Mark day complete
              </button>
            )}

            <button
              type="button"
              className="module-btn module-btn-secondary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setOpenDay(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ModuleDetail;
