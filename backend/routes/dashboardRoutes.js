const express = require('express');
const auth = require('../middleware/authMiddleware');
const dashboardCtrl = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', auth, dashboardCtrl.getDashboard);

module.exports = router;