import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockProgress, mockUser, modules as seedModules } from "./data";
const Ctx = createContext(null);
function isFinalAttemptComplete(attempt) {
  if (attempt.type === "quiz") return attempt.score / attempt.totalMarks >= 0.6;
  return true;
}
function StoreProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("hs.user");
    return raw ? JSON.parse(raw) : mockUser;
  });
  const [modules, setModules] = useState(() => {
    const raw = localStorage.getItem("hs.modules");
    if (!raw) return seedModules;
    try {
      const loaded = JSON.parse(raw);
      if (Array.isArray(loaded) && loaded[0] && loaded[0].quiz && !loaded[0].assessment) {
        return seedModules;
      }
      return loaded;
    } catch {
      return seedModules;
    }
  });
  const [progress, setProgress] = useState(() => {
    const raw = localStorage.getItem("hs.progress");
    const loaded = raw ? JSON.parse(raw) : mockProgress;
    return loaded.map((p) => {
      const seed = mockProgress.find((s) => s.moduleId === p.moduleId);
      const mergedChapters = seed ? Array.from(/* @__PURE__ */ new Set([...p.completedChapters, ...seed.completedChapters])) : p.completedChapters;
      const dailyTotal = Object.values(p.dailyScores ?? {}).reduce((s, v) => s + v, 0);
      const base = { ...p, completedChapters: mergedChapters };
      return base.score === 0 && dailyTotal > 0 ? { ...base, score: dailyTotal } : base;
    });
  });
  useEffect(() => {
    localStorage.setItem("hs.user", JSON.stringify(user));
  }, [user]);
  useEffect(() => {
    localStorage.setItem("hs.modules", JSON.stringify(modules));
  }, [modules]);
  useEffect(() => {
    localStorage.setItem("hs.progress", JSON.stringify(progress));
  }, [progress]);
  const saveModules = (mods) => setModules(mods);
  const registerModule = (moduleId) => setUser((prev) => ({
    ...prev,
    registeredModules: prev.registeredModules.includes(moduleId) ? prev.registeredModules : [...prev.registeredModules, moduleId]
  }));
  const unregisterModule = (moduleId) => setUser((prev) => ({
    ...prev,
    registeredModules: prev.registeredModules.filter((id) => id !== moduleId)
  }));
  const submitDailyQuiz = (moduleId, chapterId, score, userAnswers, totalMarks) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.moduleId === moduleId);
      const prevScore = existing?.dailyScores?.[chapterId] ?? 0;
      const newScore = Math.max(prevScore, score);
      const completedChapters = existing?.completedChapters ?? [];
      const updatedChapters = score > 0 && !completedChapters.includes(chapterId) ? [...completedChapters, chapterId] : completedChapters;
      const dailyAttempt = {
        score,
        totalMarks,
        userAnswers,
        attemptedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (existing) {
        return prev.map(
          (p) => p.moduleId === moduleId ? {
            ...p,
            completedChapters: updatedChapters,
            dailyScores: { ...p.dailyScores, [chapterId]: newScore },
            dailyQuizAttempts: { ...p.dailyQuizAttempts, [chapterId]: dailyAttempt },
            score: p.score + Math.max(0, newScore - prevScore)
          } : p
        );
      }
      return [...prev, {
        moduleId,
        completedChapters: updatedChapters,
        quizStatus: false,
        score: newScore,
        dailyScores: { [chapterId]: newScore },
        dailyQuizAttempts: { [chapterId]: dailyAttempt }
      }];
    });
  };
  const markChapter = (moduleId, chapterId) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.moduleId === moduleId);
      if (existing) {
        if (existing.completedChapters.includes(chapterId)) return prev;
        return prev.map(
          (p) => p.moduleId === moduleId ? { ...p, completedChapters: [...p.completedChapters, chapterId] } : p
        );
      }
      return [...prev, { moduleId, completedChapters: [chapterId], quizStatus: false, score: 0 }];
    });
  };
  const submitFinalAttempt = (moduleId, attempt) => {
    setProgress((prev) => {
      const scoreIncrease = attempt.type === "quiz" ? attempt.score : 0;
      const existing = prev.find((p) => p.moduleId === moduleId);
      if (existing) {
        return prev.map(
          (p) => p.moduleId === moduleId ? { ...p, quizStatus: true, score: p.score + scoreIncrease, finalAttempt: attempt } : p
        );
      }
      return [...prev, { moduleId, completedChapters: [], quizStatus: true, score: scoreIncrease, finalAttempt: attempt }];
    });
  };
  const { myPoints, myModulesCompleted } = useMemo(() => {
    let pts = 0, done = 0;
    for (const m of modules) {
      const pr = progress.find((p) => p.moduleId === m.id);
      if (!pr) continue;
      pts += pr.score;
      if (pr.finalAttempt && pr.completedChapters.length === m.chapters.length && isFinalAttemptComplete(pr.finalAttempt)) done++;
    }
    return { myPoints: pts, myModulesCompleted: done };
  }, [progress, modules]);
  return <Ctx.Provider value={{
    user,
    modules,
    saveModules,
    progress,
    markChapter,
    submitFinalAttempt,
    submitDailyQuiz,
    registerModule,
    unregisterModule,
    myPoints,
    myModulesCompleted
  }}>
      {children}
    </Ctx.Provider>;
}
function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
export {
  StoreProvider,
  useStore
};
