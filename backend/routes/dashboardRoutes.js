const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const dashboardCtrl = require('../controllers/dashboardController');

router.get('/', auth, dashboardCtrl.getDashboard);

router.get('/stats', auth, (req, res) => {
  res.json({
    totalModules: 8,
    completedModules: 3,
    averageQuizScore: 78,
    rank: 5,
    recentActivity: [
      { id: 1, action: 'Passed Git Fundamentals Quiz', date: '10 mins ago' },
      { id: 2, action: 'Reviewed Express Routing Docs', date: '3 hours ago' },
    ],
    weeklyProgress: [
      { day: 'Mon', hours: 1 },
      { day: 'Tue', hours: 4 },
      { day: 'Wed', hours: 2 },
      { day: 'Thu', hours: 6 },
      { day: 'Fri', hours: 3 },
    ],
  });
});

module.exports = router;
