const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController'); 
const auth = require('../middleware/authMiddleware');

router.post('/admin/login', authCtrl.adminLogin);
router.get('/github', authCtrl.redirectToGitHub);
router.get('/github/callback', authCtrl.handleGitHubCallback);
router.get('/me', (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[auth/me] cookie: ${Boolean(req.cookies?.token)} | origin: ${req.get('origin') || 'none'}`
    );
  }
  next();
}, auth, authCtrl.getMe);

module.exports = router;
