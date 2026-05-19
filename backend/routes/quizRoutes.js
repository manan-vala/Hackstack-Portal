const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const quizzesCtrl = require('../controllers/quizzesController');

const router = express.Router();

// GET /quizzes -> List all quizzes.
router.get('/', quizzesCtrl.listQuizzes);

// GET /quizzes/:id -> Get one quiz by id.
router.get('/:id', quizzesCtrl.getQuiz);

// POST /quizzes/:id/submit -> Submit all answers at once and calculate the final score.
router.post('/:id/submit', auth, quizzesCtrl.submitQuiz);

// POST /quizzes -> Create a new quiz (admin only).
router.post('/', auth, admin, quizzesCtrl.createQuiz);

// PATCH /quizzes/:id -> Update an existing quiz.
router.patch('/:id', quizzesCtrl.updateQuiz);

// DELETE /quizzes/:id -> Remove a quiz (admin only).
router.delete('/:id', auth, admin, quizzesCtrl.deleteQuiz);

module.exports = router;
