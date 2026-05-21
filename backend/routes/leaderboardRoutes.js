const express = require('express');
const leaderboardCtrl = require('../controllers/leaderboardController');

const router = express.Router();

// GET /leaderboards/global -> Global all-time leaderboard.
router.get('/global', leaderboardCtrl.getGlobalLeaderboard);

// GET /leaderboards/module/:moduleId -> Leaderboard for a specific module.
router.get('/module/:moduleId', leaderboardCtrl.getModuleLeaderboard);

module.exports = router;