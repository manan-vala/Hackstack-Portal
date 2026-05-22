const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');

const toObjectIdString = (value) => String(value);

const sumQuizPoints = (quizzes = []) => quizzes.reduce(
  (total, quiz) => total + (quiz.questions || []).reduce((points, question) => points + Number(question.points || 0), 0),
  0
);

const getTotalDays = (moduleDoc) => (moduleDoc.chapters || []).reduce(
  (total, chapter) => total + (chapter.days || []).length,
  0
);

const getQuizMaxScore = (quizDoc) => (quizDoc.questions || []).reduce(
  (total, question) => total + Number(question.points || 0),
  0
);

const toPlainId = (value) => String(value);

exports.getDashboard = async (req, res) => {
  try {
    const user = typeof req.user.toObject === 'function' ? req.user.toObject() : req.user;
    const registeredModuleIds = (user.registeredModules || []).map(toObjectIdString);

    const [modules, progressRecords, quizzes] = await Promise.all([
      registeredModuleIds.length ? Module.find({ _id: { $in: registeredModuleIds } }).sort({ createdAt: -1 }) : [],
      Progress.find({ userId: req.user._id }),
      registeredModuleIds.length ? Quiz.find({ moduleId: { $in: registeredModuleIds } }) : [],
    ]);

    const progressByModule = new Map(progressRecords.map((record) => [toObjectIdString(record.moduleId), record]));
    const quizzesByModule = quizzes.reduce((map, quiz) => {
      const key = toObjectIdString(quiz.moduleId);
      const bucket = map.get(key) || [];
      bucket.push(quiz);
      map.set(key, bucket);
      return map;
    }, new Map());

    const moduleRows = modules.map((moduleDoc) => {
      const moduleId = toObjectIdString(moduleDoc._id);
      const progressRecord = progressByModule.get(moduleId);
      const moduleQuizzes = quizzesByModule.get(moduleId) || [];
      const quizScoreByDayId = new Map(
        (progressRecord?.quizScores || []).map((item) => [toPlainId(item.dayId), item])
      );
      const completedDays = progressRecord?.completedDays?.length || progressRecord?.completedChapters?.length || 0;
      const totalDays = getTotalDays(moduleDoc);
      const completionPercent = progressRecord?.moduleCompleted
        ? 100
        : totalDays > 0
          ? Math.round((Math.min(completedDays, totalDays) / totalDays) * 100)
          : 0;

      const attemptedQuizCount = progressRecord?.attemptedQuizIds?.length || 0;
      const quizScore = progressRecord?.quizScores?.reduce((total, item) => total + Number(item.score || 0), 0) || 0;
      const totalQuizScore = sumQuizPoints(moduleQuizzes);
      const quizProgressPercent = moduleQuizzes.length > 0 ? Math.round((attemptedQuizCount / moduleQuizzes.length) * 100) : 0;
      const quizResults = moduleQuizzes
        .sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0))
        .map((quizDoc, index) => {
          const scoreRecord = quizScoreByDayId.get(toPlainId(quizDoc.dayId));
          const maxScore = getQuizMaxScore(quizDoc);
          const score = Number(scoreRecord?.score || 0);

          return {
            id: toPlainId(quizDoc._id),
            dayId: toPlainId(quizDoc.dayId),
            label: `Quiz ${index + 1}`,
            attempted: Boolean(scoreRecord),
            score,
            maxScore,
            percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
            questionCount: (quizDoc.questions || []).length,
          };
        });

      return {
        id: moduleId,
        slug: moduleDoc.slug,
        title: moduleDoc.title,
        description: moduleDoc.description,
        difficulty: moduleDoc.difficulty,
        totalDays,
        completedDays,
        completionPercent,
        totalQuizzes: moduleQuizzes.length,
        attemptedQuizzes: attemptedQuizCount,
        quizProgressPercent,
        quizScore,
        totalQuizScore,
        quizResults,
        progressUpdatedAt: progressRecord?.updatedAt || null,
      };
    });

    const summary = {
      registeredModules: modules.length,
      completedModules: moduleRows.filter((module) => module.completionPercent === 100).length,
      averageCompletion: moduleRows.length
        ? Math.round(moduleRows.reduce((total, module) => total + module.completionPercent, 0) / moduleRows.length)
        : 0,
      totalQuizScore: user.totalScore || 0,
      totalQuizAttempts: moduleRows.reduce((total, module) => total + module.attemptedQuizzes, 0),
      totalQuizzes: moduleRows.reduce((total, module) => total + module.totalQuizzes, 0),
      completedDays: moduleRows.reduce((total, module) => total + module.completedDays, 0),
      totalDays: moduleRows.reduce((total, module) => total + module.totalDays, 0),
    };

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      summary,
      modules: moduleRows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard data.', error: error.message });
  }
};