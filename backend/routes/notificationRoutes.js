const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuthMiddleware');
const notificationCtrl = require('../controllers/notificationController');

const adminDeleteAuth = (req, res, next) => {
  if (!req.admin || !req.admin.canDelete) {
    return res.status(403).json({ message: 'Forbidden. You do not have permission to perform delete operations.' });
  }
  next();
};

// User route to get active notifications
router.get('/', auth, notificationCtrl.listActiveNotifications);

// Admin CRUD routes
router.get('/admin', adminAuth, notificationCtrl.adminListNotifications);
router.post('/admin', adminAuth, notificationCtrl.adminCreateNotification);
router.patch('/admin/:id', adminAuth, notificationCtrl.adminToggleNotification);
router.delete('/admin/:id', adminAuth, adminDeleteAuth, notificationCtrl.adminDeleteNotification);

module.exports = router;
