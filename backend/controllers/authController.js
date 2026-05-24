const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const stateStore = new Map();

const getCallbackUrl = () => {
  const base = (
    process.env.OAUTH_CALLBACK_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
  ).replace(/\/$/, '');
  return `${base}/api/auth/google/callback`;
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// Cleanup expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (now - value.timestamp > 600000) stateStore.delete(key);
  }
}, 300000);

exports.redirectToGoogle = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, { timestamp: Date.now() });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getCallbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'offline',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

exports.handleGoogleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const frontendUrl = getFrontendUrl();

  if (error) {
    console.error('Google OAuth denied:', error);
    return res.redirect(`${frontendUrl}/login.html?error=auth_denied`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login.html?error=missing_code`);
  }

  if (!state || !stateStore.has(state)) {
    return res.redirect(`${frontendUrl}/login.html?error=invalid_state`);
  }
  stateStore.delete(state);

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: getCallbackUrl(),
        grant_type: 'authorization_code',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token: accessToken, id_token: idToken } = tokenResponse.data;

    if (!accessToken) {
      console.error('Google token exchange failed: no access_token');
      return res.redirect(`${frontendUrl}/login.html?error=auth_failed`);
    }

    // Fetch user profile from Google
    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const googleProfile = userInfoResponse.data;

    // Find or create user
    let user = await User.findOne({ googleId: googleProfile.id.toString() });
    if (!user) {
      user = await User.create({
        googleId: googleProfile.id.toString(),
        email: googleProfile.email,
        avatarUrl: googleProfile.picture || '',
        name: googleProfile.name || '',
        profileCompleted: false,
      });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.redirect(`${frontendUrl}/auth-callback`);
  } catch (err) {
    console.error('Google Auth Error:', err.response?.data || err.message);
    res.redirect(`${frontendUrl}/login.html?error=auth_failed`);
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('registeredModules', 'title slug difficulty')
    .select('-googleId');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json(user);
};

exports.completeProfile = async (req, res) => {
  try {
    const { name, username, college, year, mobileNumber, email } = req.body;

    if (!name || !username || !college || !year || !mobileNumber) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check username uniqueness
    const existing = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: req.user._id },
    });
    if (existing) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        username: username.toLowerCase(),
        college,
        year,
        mobileNumber,
        email: email || req.user.email,
        profileCompleted: true,
      },
      { new: true, runValidators: true }
    ).select('-googleId');

    res.json(user);
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
};

exports.checkUsername = async (req, res) => {
  const { username } = req.query;

  if (!username || username.length < 3) {
    return res.json({ available: false, message: 'Username must be at least 3 characters.' });
  }

  const existing = await User.findOne({ username: username.toLowerCase() });
  res.json({ available: !existing });
};

exports.logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully.' });
};

exports.adminLogin = (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const token = jwt.sign(
    { isAdmin: true, username, canDelete: true },
    process.env.JWT_SECRET,
    { expiresIn: '30d' },
  );

  return res.json({
    token,
    user: { username, isAdmin: true, canDelete: true },
  });
};
