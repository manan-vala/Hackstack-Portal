const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController'); 
const auth = require('../middleware/authMiddleware');

router.get('/github', authCtrl.redirectToGitHub);
router.get('/github/callback', authCtrl.handleGitHubCallback);
router.get('/me', auth, authCtrl.getMe);

module.exports = router;
