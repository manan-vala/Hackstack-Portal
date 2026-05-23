const express = require('express');
// adminAuth: reads ONLY from Authorization: Bearer header (never cookies).
// This guarantees admin sessions cannot bleed into the user frontend.
const adminAuth = require('../middleware/adminAuthMiddleware');

const modulesCtrl = require('../controllers/moduleController');
const quizzesCtrl = require('../controllers/quizController');
const progressCtrl = require('../controllers/progressController');
const usersCtrl = require('../controllers/userController');

const router = express.Router();

const User = require('../models/User');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');

// Admin stats route
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalModules = await Module.countDocuments();
    const activeQuizzes = await Quiz.countDocuments();
    res.json({
      totalUsers,
      totalModules,
      activeQuizzes
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats.', error: error.message });
  }
});

// Admin modules routes
router.get('/modules', adminAuth, modulesCtrl.listModules);
router.get('/modules/:id', adminAuth, modulesCtrl.getModule);
router.post('/modules', adminAuth, modulesCtrl.createModule);
router.put('/modules/:id', adminAuth, modulesCtrl.updateModule);
router.delete('/modules/:id', adminAuth, modulesCtrl.deleteModule);

// Admin quizzes routes
router.get('/quizzes', adminAuth, quizzesCtrl.listQuizzes);
router.get('/quizzes/:id', adminAuth, quizzesCtrl.getQuiz);
router.post('/quizzes', adminAuth, quizzesCtrl.createQuiz);
router.patch('/quizzes/:id', adminAuth, quizzesCtrl.updateQuiz);
router.delete('/quizzes/:id', adminAuth, quizzesCtrl.deleteQuiz);

// Admin progress routes
router.get('/progress', adminAuth, progressCtrl.listProgress);
router.get('/progress/:id', adminAuth, progressCtrl.getProgress);
router.patch('/progress/:id', adminAuth, progressCtrl.updateProgress);

// Admin users routes
router.get('/users-progress', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .populate('registeredModules', 'title slug chapters')
      .sort({ createdAt: -1 });

    const allProgress = await Progress.find();

    const progressMap = new Map();
    for (const prog of allProgress) {
      progressMap.set(`${prog.userId.toString()}_${prog.moduleId.toString()}`, prog);
    }

    const summary = users.map(user => {
      const userModules = (user.registeredModules || []).map(mod => {
        const progKey = `${user._id.toString()}_${mod._id.toString()}`;
        const prog = progressMap.get(progKey);

        const daysCompletedCount = prog ? (prog.completedDays || []).length : 0;
        const moduleScore = prog ? (prog.quizScores || []).reduce((sum, item) => sum + (item.score || 0), 0) : 0;

        const totalDaysCount = (mod.chapters || []).reduce((acc, chap) => acc + (chap.days || []).length, 0);

        return {
          moduleId: mod._id,
          title: mod.title,
          slug: mod.slug,
          daysCompleted: daysCompletedCount,
          totalDays: totalDaysCount,
          moduleScore: moduleScore
        };
      });

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        totalScore: user.totalScore,
        modulesProgress: userModules
      };
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users progress.', error: error.message });
  }
});

router.get('/users', adminAuth, usersCtrl.listUsers);
router.get('/users/:id', adminAuth, usersCtrl.getUser);
router.patch('/users/:id', adminAuth, usersCtrl.updateUser);
router.delete('/users/:id', adminAuth, usersCtrl.deleteUser);

module.exports = router;
