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

    setLoading(true);
    setError('');

    try {
      const [moduleList, progressList, quizList] = await Promise.all([
        moduleService.listModules(),
        progressService.getMyProgress(),
        quizService.listQuizzes(),
      ]);

      setModules(moduleList.map((module, index) => normalizeModule(module, index)));
      setProgress(progressList);
      setQuizzes(quizList);
    } catch (err) {
      setError(err.message || 'Failed to load learning data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const getProgressForModule = (moduleId) =>
    progress.find(
      (record) =>
        record.moduleId?._id?.toString() === moduleId ||
        record.moduleId?.toString() === moduleId
    );

  const getQuizzesForModule = (moduleId) =>
    quizzes.filter(
      (quiz) =>
        quiz.moduleId?._id?.toString() === moduleId ||
        quiz.moduleId?.toString() === moduleId
    );

  const completeDay = async (moduleId, dayId) => {
    const module = modules.find((entry) => entry.id === moduleId);
    const progressRecord = getProgressForModule(moduleId);

    if (!module || !progressRecord) {
      throw new Error('Progress record not found. Register for the module first.');
    }

    const updated = await progressService.completeDay(
      progressRecord,
      dayId,
      module.dayCount
    );

    setProgress((prev) =>
      prev.map((record) => (record._id === updated._id ? updated : record))
    );

    return updated;
  };

  const submitQuiz = async (quizId, answers) => {
    const result = await quizService.submitQuiz(quizId, answers);
    await loadData();
    return result;
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
