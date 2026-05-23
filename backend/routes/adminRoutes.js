const express = require('express');
// adminAuth: reads ONLY from Authorization: Bearer header (never cookies).
// This guarantees admin sessions cannot bleed into the user frontend.
const adminAuth = require('../middleware/adminAuthMiddleware');

const modulesCtrl = require('../controllers/moduleController');
const quizzesCtrl = require('../controllers/quizController');
const progressCtrl = require('../controllers/progressController');
const usersCtrl = require('../controllers/userController');

const router = express.Router();

// Admin modules routes
router.get('/modules', adminAuth, modulesCtrl.listModules);
router.get('/modules/:id', adminAuth, modulesCtrl.getModule);
router.post('/modules', adminAuth, modulesCtrl.createModule);
router.put('/modules/:id', adminAuth, modulesCtrl.updateModule);
router.delete('/modules/:id', adminAuth, modulesCtrl.deleteModule);

// Admin quizzes routes
router.get('/quizzes', adminAuth, quizzesCtrl.listQuizzes);
router.get('/quizzes/:id', adminAuth, quizzesCtrl.getQuiz);
router.post('/quizzes', adminAuth, quizzesCtrl.createQuiz);
router.patch('/quizzes/:id', adminAuth, quizzesCtrl.updateQuiz);
router.delete('/quizzes/:id', adminAuth, quizzesCtrl.deleteQuiz);

// Admin progress routes
router.get('/progress', adminAuth, progressCtrl.listProgress);
router.get('/progress/:id', adminAuth, progressCtrl.getProgress);
router.patch('/progress/:id', adminAuth, progressCtrl.updateProgress);

// Admin users routes
router.get('/users', adminAuth, usersCtrl.listUsers);
router.get('/users/:id', adminAuth, usersCtrl.getUser);
router.patch('/users/:id', adminAuth, usersCtrl.updateUser);
router.delete('/users/:id', adminAuth, usersCtrl.deleteUser);

module.exports = router;
