const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

exports.redirectToGitHub = (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(redirectUri);
};

exports.handleGitHubCallback = async (req, res) => {
  const { code } = req.query;

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

    // 4. Generate a JWT for your portal
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 5. Redirect back to the frontend React app
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?token=${token}&username=${user.username}&id=${user._id}&isAdmin=${user.isAdmin}&avatarUrl=${encodeURIComponent(user.avatarUrl || '')}`;
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
