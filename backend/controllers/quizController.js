const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const User = require('../models/User');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('moduleId', 'title slug').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes.', error: error.message });
  }
};

exports.getQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid quiz id.' });
  }

  try {
    const quiz = await Quiz.findById(req.params.id).populate('moduleId', 'title slug');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz.', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid quiz id.' });
  }

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    const progressRecord = await Progress.findOne({ userId: req.user._id, moduleId: quiz.moduleId });

    if (progressRecord?.attemptedQuizIds?.some((attemptedQuizId) => attemptedQuizId.equals(quiz._id))) {
      return res.status(409).json({ message: 'This quiz can only be submitted once.' });
    }

    const submittedAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const normalizedAnswers = quiz.questions.map((question, questionIndex) => {
      const rawAnswer = submittedAnswers[questionIndex];
      const selectedIndex =
        typeof rawAnswer === 'number'
          ? rawAnswer
          : rawAnswer && typeof rawAnswer.selectedIndex === 'number'
          ? rawAnswer.selectedIndex
          : null;

      return {
        questionIndex,
        selectedIndex
      };
    });

    const score = normalizedAnswers.reduce((total, answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (!question || answer.selectedIndex === null) return total;
      return answer.selectedIndex === question.correctIndex ? total + question.points : total;
    }, 0);

    const maxScore = quiz.questions.reduce((total, question) => total + question.points, 0);

    // Update user's total score
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $inc: { totalScore: score } }, { new: true, runValidators: true });

    await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: quiz.moduleId },
      {
        $setOnInsert: { userId: req.user._id, moduleId: quiz.moduleId },
        $addToSet: { attemptedQuizIds: quiz._id },
        $push: { quizScores: { dayId: quiz.dayId, score } }
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ message: 'Quiz submitted successfully.', score, maxScore, userTotalScore: updatedUser.totalScore, percentage: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This quiz can only be submitted once.' });
    res.status(400).json({ message: 'Failed to submit quiz.', error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create quiz.', error: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid quiz id.' });
  }

  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update quiz.', error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid quiz id.' });
  }

  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    res.json({ message: 'Quiz deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quiz.', error: error.message });
  }
};
