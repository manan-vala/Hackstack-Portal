const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');

const stateStore = new Map();

// OAuth callback must match the URL the browser hits (use Vite proxy in dev → port 5173).
const getCallbackUrl = () => {
  const base = (
    process.env.OAUTH_CALLBACK_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
  ).replace(/\/$/, '');
  return `${base}/api/auth/github/callback`;
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

exports.redirectToGitHub = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, { timestamp: Date.now() });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: getCallbackUrl(),
    scope: 'user:email',
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

exports.handleGitHubCallback = async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const frontendUrl = getFrontendUrl();

  if (error) {
    console.error('GitHub OAuth denied:', error, error_description || '');
    return res.redirect(`${frontendUrl}/login?error=auth_denied`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=missing_code`);
  }

  if (!state || !stateStore.has(state)) {
    return res.redirect(`${frontendUrl}/login?error=invalid_state`);
  }
  stateStore.delete(state);

  try {
    const callbackUrl = getCallbackUrl();

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token: accessToken, error: tokenError, error_description: tokenDesc } =
      tokenResponse.data;

    if (tokenError || !accessToken) {
      console.error('GitHub token exchange failed:', tokenError, tokenDesc || '');
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubProfile = userResponse.data;
    let email = githubProfile.email;

    if (!email) {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const primary = emailsResponse.data.find((e) => e.primary && e.verified);
      email = primary?.email || emailsResponse.data[0]?.email;
    }

    let user = await User.findOne({ githubId: githubProfile.id.toString() });
    if (!user) {
      user = await User.create({
        githubId: githubProfile.id.toString(),
        username: githubProfile.login,
        email: email || `${githubProfile.login}@users.noreply.github.com`,
        avatarUrl: githubProfile.avatar_url,
      });
    }

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

    const redirectUrl = new URL('/auth-callback', frontendUrl);
    redirectUrl.searchParams.set('username', user.username);
    res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('GitHub Auth Error:', err.response?.data || err.message);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('registeredModules', 'title slug difficulty')
    .select('-githubId');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json(user);
};
