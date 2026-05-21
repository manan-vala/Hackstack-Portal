const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getQuizSubmissionDeadline = (quiz) => {
  if (!quiz?.createdAt) return null;

  const deadline = new Date(quiz.createdAt);
  deadline.setUTCHours(23, 59, 59, 999);
  return deadline;
};

const serializeQuiz = (quiz) => {
  const submissionDeadline = getQuizSubmissionDeadline(quiz);
  const now = new Date();

  return {
    ...quiz.toObject(),
    submissionDeadline,
    isExpired: submissionDeadline ? now > submissionDeadline : false
  };
};

const updateLeaderboardEntry = async ({ user, moduleId, score, session }) => {
  await Leaderboard.findOneAndUpdate(
    {
      userId: user._id,
      moduleId: moduleId ?? null,
      periodType: 'all-time'
    },
    {
      $setOnInsert: {
        userId: user._id,
        moduleId: moduleId ?? null,
        periodType: 'all-time',
        score: 0
      },
      $set: {
        username: user.username,
        avatarUrl: user.avatarUrl
      },
      $inc: { score }
    },
    { new: true, upsert: true, runValidators: true, session }
  );
};

exports.listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('moduleId', 'title slug').sort({ createdAt: -1 });
    res.json(quizzes.map(serializeQuiz));
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
    res.json(serializeQuiz(quiz));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz.', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid quiz id.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const quiz = await Quiz.findById(req.params.id).session(session);
    if (!quiz) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    const submissionDeadline = getQuizSubmissionDeadline(quiz);
    if (submissionDeadline && new Date() > submissionDeadline) {
      await session.abortTransaction();
      return res.status(403).json({
        message: 'This quiz has closed for the day.',
        submissionDeadline
      });
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

    // Atomic: Increment score and record attempt in same transaction
    const progressUpdate = await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: quiz.moduleId, attemptedQuizIds: { $ne: quiz._id } },
      {
        $setOnInsert: { userId: req.user._id, moduleId: quiz.moduleId },
        $addToSet: { attemptedQuizIds: quiz._id },
        $push: { quizScores: { dayId: quiz.dayId, score } }
      },
      { new: true, upsert: true, runValidators: true, session }
    );

    if (!progressUpdate) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'This quiz can only be submitted once.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $inc: { totalScore: score } }, { new: true, runValidators: true, session });
    
    if (!updatedUser) {
      await session.abortTransaction();
      return res.status(401).json({ message: 'User not found. Token may be stale.' });
    }

    await updateLeaderboardEntry({
      user: updatedUser,
      moduleId: quiz.moduleId,
      score,
      session
    });

    await updateLeaderboardEntry({
      user: updatedUser,
      moduleId: null,
      score,
      session
    });

    await session.commitTransaction();
    res.status(201).json({ message: 'Quiz submitted successfully.', score, maxScore, userTotalScore: updatedUser.totalScore, percentage: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100) });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) return res.status(409).json({ message: 'This quiz can only be submitted once.' });
    res.status(400).json({ message: 'Failed to submit quiz.', error: error.message });
  } finally {
    session.endSession();
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(serializeQuiz(quiz));
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
    res.json(serializeQuiz(quiz));
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
