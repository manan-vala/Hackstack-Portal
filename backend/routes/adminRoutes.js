const express = require('express');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const modulesCtrl = require('../controllers/moduleController');
const quizzesCtrl = require('../controllers/quizController');
const progressCtrl = require('../controllers/progressController');
const usersCtrl = require('../controllers/userController');

const router = express.Router();

// Admin modules routes
router.get('/modules', auth, admin, modulesCtrl.listModules);
router.get('/modules/:id', auth, admin, modulesCtrl.getModule);
router.post('/modules', auth, admin, modulesCtrl.createModule);
router.put('/modules/:id', auth, admin, modulesCtrl.updateModule);
router.delete('/modules/:id', auth, admin, modulesCtrl.deleteModule);

// Admin quizzes routes
router.get('/quizzes', auth, admin, quizzesCtrl.listQuizzes);
router.get('/quizzes/:id', auth, admin, quizzesCtrl.getQuiz);
router.post('/quizzes', auth, admin, quizzesCtrl.createQuiz);
router.patch('/quizzes/:id', auth, admin, quizzesCtrl.updateQuiz);
router.delete('/quizzes/:id', auth, admin, quizzesCtrl.deleteQuiz);

// Admin progress routes
router.get('/progress', auth, admin, progressCtrl.listProgress);
router.get('/progress/:id', auth, admin, progressCtrl.getProgress);
router.patch('/progress/:id', auth, admin, progressCtrl.updateProgress);

// Admin users routes
router.get('/users', auth, admin, usersCtrl.listUsers);
router.get('/users/:id', auth, admin, usersCtrl.getUser);
router.patch('/users/:id', auth, admin, usersCtrl.updateUser);
router.delete('/users/:id', auth, admin, usersCtrl.deleteUser);

module.exports = router;
