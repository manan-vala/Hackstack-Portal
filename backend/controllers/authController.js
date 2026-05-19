const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');

// Simple in-memory state store (expires after 10 minutes)
const stateStore = new Map();

// Cleanup expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (now - value.timestamp > 600000) stateStore.delete(key);
  }
}, 300000);

exports.redirectToGitHub = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, { timestamp: Date.now() });
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email&state=${state}`;
  res.redirect(redirectUri);
};

exports.handleGitHubCallback = async (req, res) => {
  const { code, state } = req.query;

  // Validate state parameter
  if (!state || !stateStore.has(state)) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
  }
  stateStore.delete(state);

  try {
    // 1. Exchange the code for an access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // 2. Fetch the user's profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const githubProfile = userResponse.data;

    // 3. Find or create the user in your database
    let user = await User.findOne({ githubId: githubProfile.id.toString() });
    if (!user) {
      user = await User.create({
        githubId: githubProfile.id.toString(),
        username: githubProfile.login,
        email: githubProfile.email || `${githubProfile.login}@github.com`,
        avatarUrl: githubProfile.avatar_url,
      });
    }

    // 4. Generate a JWT for your portal (no role claims to avoid stale state)
    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 5. Set JWT as secure HttpOnly cookie (cannot be accessed by JS, mitigates XSS/credential leaks)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 6. Redirect to frontend without token in URL
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?username=${user.username}&id=${user._id}&avatarUrl=${encodeURIComponent(user.avatarUrl || '')}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('GitHub Auth Error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-githubId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
