const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminWhitelist = require('../models/AdminWhitelist');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.admin_maker_token;
  if (!token) {
    return res.redirect('/admin-whitelist/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackstack_portal_jwt_67');
    if (decoded && decoded.isAdminMaker) {
      req.user = decoded;
      return next();
    }
    return res.redirect('/admin-whitelist/login');
  } catch (err) {
    return res.redirect('/admin-whitelist/login');
  }
};

// GET /admin-whitelist/login
router.get('/login', (req, res) => {
  const token = req.cookies?.admin_maker_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackstack_portal_jwt_67');
      if (decoded && decoded.isAdminMaker) {
        return res.redirect('/admin-whitelist');
      }
    } catch (e) {}
  }
  res.render('login', { error: null });
});

// POST /admin-whitelist/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const makerUser = process.env.ADMIN_MAKER_USER || process.env.ADMIN_USERNAME || 'makeradmin';
  const makerPass = process.env.ADMIN_MAKER_PASS || process.env.ADMIN_PASSWORD || 'makerpassword123';

  if (username === makerUser && password === makerPass) {
    const token = jwt.sign(
      { isAdminMaker: true, username },
      process.env.JWT_SECRET || 'hackstack_portal_jwt_67',
      { expiresIn: '1d' }
    );
    res.cookie('admin_maker_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.redirect('/admin-whitelist');
  } else {
    return res.render('login', { error: 'Invalid User ID or Password' });
  }
});

// GET /admin-whitelist/logout
router.get('/logout', (req, res) => {
  res.clearCookie('admin_maker_token');
  res.redirect('/admin-whitelist/login');
});

// GET /admin-whitelist (Dashboard)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await AdminWhitelist.find().sort({ createdAt: -1 });
    res.render('manage-whitelist', { list, error: null, success: null });
  } catch (err) {
    res.render('manage-whitelist', { list: [], error: 'Failed to load whitelist: ' + err.message, success: null });
  }
});

// POST /admin-whitelist/add
router.post('/add', authMiddleware, async (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const canDelete = req.body.canDelete === 'on';

  if (!email) {
    const list = await AdminWhitelist.find().sort({ createdAt: -1 });
    return res.render('manage-whitelist', { list, error: 'Email address is required.', success: null });
  }

  try {
    await AdminWhitelist.create({ email, canDelete });
    res.redirect('/admin-whitelist');
  } catch (err) {
    const list = await AdminWhitelist.find().sort({ createdAt: -1 });
    const errMsg = err.code === 11000 ? 'Email is already whitelisted.' : err.message;
    res.render('manage-whitelist', { list, error: 'Failed to add email: ' + errMsg, success: null });
  }
});

// POST /admin-whitelist/remove/:id
router.post('/remove/:id', authMiddleware, async (req, res) => {
  try {
    await AdminWhitelist.findByIdAndDelete(req.params.id);
    res.redirect('/admin-whitelist');
  } catch (err) {
    const list = await AdminWhitelist.find().sort({ createdAt: -1 });
    res.render('manage-whitelist', { list, error: 'Failed to remove email: ' + err.message, success: null });
  }
});

// POST /admin-whitelist/toggle-delete/:id
router.post('/toggle-delete/:id', authMiddleware, async (req, res) => {
  try {
    const admin = await AdminWhitelist.findById(req.params.id);
    if (admin) {
      admin.canDelete = !admin.canDelete;
      await admin.save();
    }
    res.redirect('/admin-whitelist');
  } catch (err) {
    const list = await AdminWhitelist.find().sort({ createdAt: -1 });
    res.render('manage-whitelist', { list, error: 'Failed to update permission: ' + err.message, success: null });
  }
});

module.exports = router;
