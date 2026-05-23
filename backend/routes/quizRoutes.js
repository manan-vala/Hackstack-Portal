const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuthMiddleware");
const quizzesCtrl = require("../controllers/quizController");

const router = express.Router();

// GET /quizzes -> List all quizzes.
router.get("/", quizzesCtrl.listQuizzes);

// GET /quizzes/:id -> Get one quiz by id.
router.get("/:moduleId/:dayId", auth, quizzesCtrl.getQuizByDay);

// GET /quizzes/:id -> Get quiz by mongoDB ID (useful for Admin/Updates)
router.get("/:id", auth, quizzesCtrl.getQuiz);

// POST /quizzes/:id/submit -> Submit all answers at once and calculate the final score.
router.post("/:id/submit", auth, quizzesCtrl.submitQuiz);

// POST /quizzes -> Create a new quiz (admin portal only).
router.post("/", adminAuth, quizzesCtrl.createQuiz);

// PATCH /quizzes/:id -> Update an existing quiz (admin portal only).
router.patch("/:id", adminAuth, quizzesCtrl.updateQuiz);

// DELETE /quizzes/:id -> Remove a quiz (admin portal only).
router.delete("/:id", adminAuth, quizzesCtrl.deleteQuiz);

module.exports = router;
