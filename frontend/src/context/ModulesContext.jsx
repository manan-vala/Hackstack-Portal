import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { moduleService } from '../services/moduleService';
import { progressService } from '../services/progressService';
import { quizService } from '../services/quizService';
import { getRegisteredModuleIds, normalizeModule } from '../utils/moduleAdapter';

const ModulesContext = createContext(null);

export function ModulesProvider({ children }) {
  const { user, refreshUser } = useAuth();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const registeredModuleIds = useMemo(
    () => getRegisteredModuleIds(user),
    [user]
  );

  const loadData = useCallback(async () => {
    if (!user) {
      setModules([]);
      setProgress([]);
      setQuizzes([]);
      setLoading(false);
      return;
    }

    if (modules.length === 0) {
      setLoading(true);
    }
    setError("");

    try {
      const [moduleList, progressList, quizList] = await Promise.all([
        moduleService.listModules(),
        progressService.getMyProgress(),
        quizService.listQuizzes(),
      ]);

      setModules(
        moduleList.map((module, index) => normalizeModule(module, index)),
      );
      setProgress(progressList);
      setQuizzes(quizList);
    } catch (err) {
      setError(err.message || "Failed to load learning data.");
    } finally {
      setLoading(false);
    }
  }, [user, modules.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const registerModule = async (moduleId) => {
    await moduleService.registerModule(moduleId);
    await refreshUser();
    await loadData();
  };

  const unregisterModule = async (moduleId) => {
    await moduleService.unregisterModule(moduleId);
    await refreshUser();
    await loadData();
  };

  const getProgressForModule = useCallback(
    (moduleId) =>
      progress.find(
        (record) =>
          record.moduleId?._id?.toString() === moduleId ||
          record.moduleId?.toString() === moduleId,
      ),
    [progress],
  );

  const getQuizzesForModule = useCallback(
    (moduleId) =>
      quizzes.filter(
        (quiz) =>
          quiz.moduleId?._id?.toString() === moduleId ||
          quiz.moduleId?.toString() === moduleId,
      ),
    [quizzes],
  );

  const completeDay = async (moduleId, dayId) => {
    // Fetch latest progress directly to avoid stale state issues
    const currentProgress = await progressService.getMyProgress();
    const progressRecord = currentProgress.find(
      (record) =>
        record.moduleId?._id?.toString() === moduleId ||
        record.moduleId?.toString() === moduleId,
    );

    if (!progressRecord) {
      throw new Error(
        "Progress record not found. Register for the module first.",
      );
    }

    const module = modules.find((entry) => entry.id === moduleId);
    const updated = await progressService.completeDay(
      progressRecord,
      dayId,
      module?.dayCount || 0,
    );

    await loadData();
    return updated;
  };

  const submitQuiz = async (quizId, answers) => {
    try {
      const result = await quizService.submitQuiz(quizId, answers);
      await loadData();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    modules,
    progress,
    quizzes,
    loading,
    error,
    registeredModuleIds,
    registerModule,
    unregisterModule,
    getProgressForModule,
    getQuizzesForModule,
    completeDay,
    submitQuiz,
    reload: loadData,
  };

  return <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>;
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within ModulesProvider');
  }
  return context;
}
