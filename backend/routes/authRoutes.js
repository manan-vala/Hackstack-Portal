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

// Clears the HttpOnly session cookie — works even without a valid token
router.post('/logout', authCtrl.logout);
router.get('/logout', authCtrl.logout);

const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/admin-check', async (req, res) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = bearerToken || req.cookies?.token;

    if (!token) {
      return res.json({ authorized: false, loginRequired: true });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.json({ authorized: false, loginRequired: true });
    }

    const userId = decoded.id || decoded._id;
    if (!userId) {
      return res.json({ authorized: false, loginRequired: true });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ authorized: false, loginRequired: true });
    }

    // Check if the user's username is whitelisted in the database
    const AdminWhitelist = require('../models/AdminWhitelist');
    const isWhitelisted = await AdminWhitelist.findOne({
      githubUsername: user.username.toLowerCase()
    });

    const allowedUsernames = (process.env.ALLOWED_ADMIN_GITHUB_USERNAMES || "")
      .toLowerCase()
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const allowedIds = (process.env.ALLOWED_ADMIN_GITHUB_IDS || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const isUsernameAllowed = user.username && allowedUsernames.includes(user.username.toLowerCase());
    const isIdAllowed = user.githubId && allowedIds.includes(user.githubId.toString());

    if (isWhitelisted || isUsernameAllowed || isIdAllowed) {
      const canDelete = isWhitelisted ? !!isWhitelisted.canDelete : false;
      // Generate a signed admin JWT
      const token = jwt.sign(
        { isAdmin: true, username: user.username, canDelete },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        authorized: true,
        token,
        user: { username: user.username, isAdmin: true, canDelete }
      });
    }

    return res.json({
      authorized: false,
      forbidden: true,
      message: "Your GitHub account is not authorized to access the admin portal."
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;

