import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useModules } from '../context/ModulesContext';
import './modules.css';

function ModuleCatalog() {
  const {
    modules,
    loading,
    error,
    registeredModuleIds,
    registerModule,
    unregisterModule,
    getProgressForModule,
  } = useModules();
  const [actionError, setActionError] = useState('');
  const [pendingId, setPendingId] = useState('');

  const handleRegister = async (moduleId) => {
    setActionError('');
    setPendingId(moduleId);
    try {
      await registerModule(moduleId);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPendingId('');
    }
  };

  const handleUnregister = async (moduleId) => {
    setActionError('');
    setPendingId(moduleId);
    try {
      await unregisterModule(moduleId);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPendingId('');
    }
  };

  if (loading) {
    return <div className="modules-shell">Loading modules...</div>;
  }

  return (
    <div className="modules-shell">
      <header className="modules-hero">
        <h1>Your Learning Path</h1>
        <p>Register for modules, complete daily lessons, and track quiz progress on your dashboard.</p>
      </header>

      {error ? <div className="modules-alert">{error}</div> : null}
      {actionError ? <div className="modules-alert">{actionError}</div> : null}

      {modules.length === 0 ? (
        <div className="modules-alert">
          No modules found in the database yet. Ask an admin to publish modules via the API.
        </div>
      ) : (
        <div className="modules-grid">
          {modules.map((module) => {
            const isRegistered = registeredModuleIds.includes(module.id);
            const progress = getProgressForModule(module.id);
            const completedDays = progress?.completedDays?.length || 0;
            const pct =
              module.dayCount > 0
                ? Math.round((completedDays / module.dayCount) * 100)
                : 0;

            return (
              <article key={module.id} className="module-catalog-card">
                <div
                  className="module-catalog-header"
                  style={{
                    background:
                      'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                  }}
                >
                  <span>Module {module.week}</span>
                  <h2>{module.title}</h2>
                </div>
                <div className="module-catalog-body">
                  <p>{module.description}</p>
                  <div className="module-meta">
                    <span>{module.dayCount} days</span>
                    <span>{module.difficulty || 'All levels'}</span>
                    {isRegistered ? <span>{pct}% complete</span> : <span>Not enrolled</span>}
                  </div>
                  <div className="module-actions">
                    {isRegistered ? (
                      <>
                        <Link
                          to={`/modules/${module.slug}`}
                          className="module-btn module-btn-secondary"
                        >
                          {completedDays > 0 ? 'Resume' : 'Start'}
                        </Link>
                        <button
                          type="button"
                          className="module-btn module-btn-ghost"
                          disabled={pendingId === module.id}
                          onClick={() => handleUnregister(module.id)}
                        >
                          Unenroll
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="module-btn module-btn-primary"
                        disabled={pendingId === module.id}
                        onClick={() => handleRegister(module.id)}
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ModuleCatalog;
