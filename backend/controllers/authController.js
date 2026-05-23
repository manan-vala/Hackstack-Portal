const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
    prompt: 'select_account',
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
        githubAccessToken: accessToken,
      });
    } else {
      user.githubAccessToken = accessToken;
      await user.save();
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
  // Admin portal is fully decoupled from GitHub OAuth and has no User record.
  // Regular GitHub users never carry isAdmin, so no check is needed here.
  const user = await User.findById(req.user._id)
    .populate('registeredModules', 'title slug difficulty')
    .select('-githubId');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json(user);
};

exports.logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';

  try {
    const bearerToken = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = bearerToken || req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id;
      if (userId) {
        const user = await User.findById(userId);
        if (user && user.githubAccessToken) {
          const credentials = Buffer.from(
            `${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`
          ).toString('base64');

          try {
            await axios.delete(
              `https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/grant`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                  Accept: 'application/vnd.github+json',
                },
                data: {
                  access_token: user.githubAccessToken,
                },
              }
            );
            console.log(`Successfully revoked GitHub grant for user ${user.username}`);
          } catch (err) {
            console.error('Failed to revoke GitHub grant:', err.response?.data || err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during GitHub token revocation on logout:', err.message);
  }

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

  // Admin auth is entirely credential-based — no MongoDB User record is
  // created or queried. The admin portal is fully decoupled from GitHub OAuth.
  const token = jwt.sign(
    { isAdmin: true, username },
    process.env.JWT_SECRET,
    { expiresIn: '30d' },
  );

  // Token is returned in the JSON body only (NOT set as a cookie).
  // The admin portal stores it in localStorage and sends it as a Bearer header,
  // keeping it completely isolated from the user frontend's HttpOnly cookie.
  return res.json({
    token,
    user: { username, isAdmin: true },
  });
};
