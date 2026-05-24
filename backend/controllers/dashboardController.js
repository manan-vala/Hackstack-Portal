const User = require('../models/User');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const Notification = require('../models/Notification');

const countModuleDays = (moduleDoc) => {
  if (!moduleDoc?.chapters) return 0;
  return moduleDoc.chapters.reduce(
    (total, chapter) => total + (chapter.days?.length || 0),
    0
  );
};

const getQuizMaxScore = (quiz) =>
  (quiz.questions || []).reduce((sum, question) => sum + (question.points || 0), 0);

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('registeredModules');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const registeredModules = user.registeredModules || [];
    const moduleIds = registeredModules.map((moduleDoc) => moduleDoc._id);

    const [progressRecords, quizzes, activeNotifications] = await Promise.all([
      Progress.find({ userId: user._id }),
      moduleIds.length
        ? Quiz.find({ moduleId: { $in: moduleIds } })
        : Promise.resolve([]),
      Notification.find({ active: true }).sort({ createdAt: -1 })
    ]);

    const progressByModule = new Map(
      progressRecords.map((record) => [record.moduleId.toString(), record])
    );

    const quizzesByModule = new Map();
    for (const quiz of quizzes) {
      const key = quiz.moduleId.toString();
      if (!quizzesByModule.has(key)) quizzesByModule.set(key, []);
      quizzesByModule.get(key).push(quiz);
    }

    let totalDays = 0;
    let completedDays = 0;
    let totalQuizzes = 0;
    let totalQuizAttempts = 0;
    let totalQuizScore = 0;
    let completedModules = 0;
    let completionSum = 0;

    const modules = registeredModules.map((moduleDoc) => {
      const moduleId = moduleDoc._id.toString();
      const progress = progressByModule.get(moduleId);
      const moduleQuizzes = quizzesByModule.get(moduleId) || [];

      const moduleTotalDays = countModuleDays(moduleDoc);
      const moduleCompletedDays = progress?.completedDays?.length || 0;
      const completionPercent =
        moduleTotalDays > 0
          ? Math.round((moduleCompletedDays / moduleTotalDays) * 100)
          : 0;

      if (progress?.moduleCompleted) completedModules += 1;

      totalDays += moduleTotalDays;
      completedDays += moduleCompletedDays;
      totalQuizzes += moduleQuizzes.length;

      const attemptedSet = new Set(
        (progress?.attemptedQuizIds || []).map((id) => id.toString())
      );
      const attemptsByDay = new Map(
        (progress?.quizScores || []).map((entry) => [
          entry.dayId?.toString(),
          entry,
        ]),
      );

      let moduleQuizScore = 0;
      let moduleQuizMax = 0;

      const quizResults = moduleQuizzes.map((quiz, index) => {
        const maxScore = getQuizMaxScore(quiz);
        const attempted = attemptedSet.has(quiz._id.toString());
        const result = attempted
          ? attemptsByDay.get(quiz.dayId?.toString())
          : null;
        const score = result?.score ?? 0;

        if (attempted) {
          moduleQuizScore += score;
        }
        moduleQuizMax += maxScore;

        return {
          id: quiz._id,
          label: `Quiz ${index + 1}`,
          attempted,
          score,
          maxScore,
          userAnswers: result?.userAnswers || [],
          questionCount: quiz.questions?.length || 0,
          percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        };
      });

      const attemptedQuizzes = quizResults.filter((quiz) => quiz.attempted).length;
      totalQuizAttempts += attemptedQuizzes;
      totalQuizScore += moduleQuizScore;

      const quizProgressPercent =
        moduleQuizzes.length > 0
          ? Math.round((attemptedQuizzes / moduleQuizzes.length) * 100)
          : 0;

      completionSum += completionPercent;

      return {
        id: moduleId,
        slug: moduleDoc.slug,
        title: moduleDoc.title,
        description: moduleDoc.description,
        difficulty: moduleDoc.difficulty || 'Module',
        totalDays: moduleTotalDays,
        completedDays: moduleCompletedDays,
        completionPercent,
        totalQuizzes: moduleQuizzes.length,
        attemptedQuizzes,
        quizProgressPercent,
        quizScore: moduleQuizScore,
        totalQuizScore: moduleQuizMax,
        progressUpdatedAt: progress?.updatedAt || null,
        quizResults,
      };
    });

    const registeredCount = registeredModules.length;
    const averageCompletion =
      registeredCount > 0 ? Math.round(completionSum / registeredCount) : 0;

    res.json({
      user: { username: user.username },
      summary: {
        registeredModules: registeredCount,
        completedModules,
        averageCompletion,
        totalQuizScore,
        totalQuizAttempts,
        totalQuizzes,
        completedDays,
        totalDays,
      },
      modules,
      notifications: activeNotifications
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load dashboard.',
      error: error.message,
    });
  }
};
