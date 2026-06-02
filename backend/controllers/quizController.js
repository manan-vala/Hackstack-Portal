const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Module = require("../models/Module");
const Progress = require("../models/Progress");
const User = require("../models/User");
const Leaderboard = require("../models/Leaderboard");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const serializeQuiz = (quiz) => {
  const rawQuiz = quiz.toObject();
  const moduleId = rawQuiz.moduleId?._id || rawQuiz.moduleId;

  return {
    ...rawQuiz,
    moduleId: rawQuiz.moduleId,
    moduleRefId: moduleId?.toString?.() || moduleId,
    dayId: rawQuiz.dayId?.toString?.() || rawQuiz.dayId,
    submissionDeadline: null,
    isExpired: false,
  };
};

const getModuleDayIndex = (moduleDoc, dayId) => {
  if (!moduleDoc || !dayId) return -1;

  let dayIndex = 0;

  for (const chapter of moduleDoc.chapters || []) {
    for (const day of chapter.days || []) {
      if (day?._id?.toString() === dayId.toString()) {
        return dayIndex;
      }

      dayIndex += 1;
    }
  }

  return -1;
};

const updateLeaderboardEntry = async ({ user, moduleId, score }) => {
  await Leaderboard.findOneAndUpdate(
    {
      userId: user._id,
      moduleId: moduleId ?? null,
      periodType: "all-time",
    },
    {
      $setOnInsert: {
        userId: user._id,
        moduleId: moduleId ?? null,
        periodType: "all-time",
        score: 0,
      },
      $set: {
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      $inc: { score },
    },
    { new: true, upsert: true, runValidators: true },
  );
};

exports.listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("moduleId", "title slug")
      .sort({ createdAt: -1 });
    res.json(quizzes.map(serializeQuiz));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch quizzes.", error: error.message });
  }
};

exports.getQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid quiz id." });
  }

  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "moduleId",
      "title slug",
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json(serializeQuiz(quiz));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch quiz.", error: error.message });
  }
};

exports.getQuizByDay = async (req, res) => {
  try {
    const { moduleId, dayId } = req.params;

    if (!isValidObjectId(moduleId) || !isValidObjectId(dayId)) {
      return res.status(400).json({ message: "Invalid module id or day id." });
    }

    const exactQuiz = await Quiz.findOne({ moduleId, dayId }).populate(
      "moduleId",
      "title slug",
    );

    if (exactQuiz) {
      return res.json(serializeQuiz(exactQuiz));
    }

    const moduleDoc = await Module.findById(moduleId).select("chapters");
    const requestedDayIndex = getModuleDayIndex(moduleDoc, dayId);

    if (requestedDayIndex === -1) {
      return res.status(404).json({ message: "Quiz not found for this day." });
    }

    const moduleQuizzes = await Quiz.find({ moduleId })
      .populate("moduleId", "title slug")
      .sort({ createdAt: 1 });

    const fallbackQuiz = moduleQuizzes[requestedDayIndex];

    if (!fallbackQuiz) {
      return res.status(404).json({ message: "Quiz not found for this day." });
    }

    res.json(serializeQuiz(fallbackQuiz));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch quiz.", error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  console.log(`>>> [SUBMIT_START] QuizID: ${req.params.id}, User: ${req.user?._id}`);
  
  if (!isValidObjectId(req.params.id)) {
    console.log(`>>> [VAL_ERR] Invalid Quiz ID: ${req.params.id}`);
    return res.status(400).json({ message: "[VAL_ERR] Invalid quiz id." });
  }

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      console.log(`>>> [NOT_FOUND] Quiz ${req.params.id} not found in DB`);
      return res.status(404).json({ message: "[NOT_FOUND] Quiz not found." });
    }

    console.log(`>>> [QUIZ_FOUND] DayID: ${quiz.dayId}, ModuleID: ${quiz.moduleId}`);

    const submittedAnswers = Array.isArray(req.body.answers)
      ? req.body.answers
      : [];
    
    console.log(`>>> [ANSWERS_RECV] Count: ${submittedAnswers.length}`);

    // Ensure we have questions before mapping
    if (!quiz.questions || quiz.questions.length === 0) {
      console.log(`>>> [DATA_ERR] Quiz has no questions array`);
      return res.status(400).json({ message: "[DATA_ERR] Quiz has no questions." });
    }

    const normalizedAnswers = quiz.questions.map((question, questionIndex) => {
      const rawAnswer = submittedAnswers[questionIndex];
      
      let selectedIndex = -1; // Default to -1 (skipped) instead of null
      if (typeof rawAnswer === "number") {
        selectedIndex = rawAnswer;
      } else if (rawAnswer && typeof rawAnswer.selectedIndex === "number") {
        selectedIndex = rawAnswer.selectedIndex;
      }

      return {
        questionIndex,
        selectedIndex,
      };
    });

    const score = normalizedAnswers.reduce((total, answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (!question || answer.selectedIndex === -1) return total; // Check for -1
      return answer.selectedIndex === question.correctIndex
        ? total + (question.points || 0)
        : total;
    }, 0);

    const maxScore = quiz.questions.reduce(
      (total, question) => total + (question.points || 0),
      0,
    );

    const userAnswers = normalizedAnswers.map((a) => a.selectedIndex);
    console.log(`>>> [SCORE_CALC] Score: ${score}/${maxScore}`);

    // 1. Ensure progress record exists
    let progress = await Progress.findOne({
      userId: req.user._id,
      moduleId: quiz.moduleId,
    });

    if (!progress) {
      console.log(`>>> [PROGRESS_MISSING] Creating new progress record`);
      try {
        progress = await Progress.create({
          userId: req.user._id,
          moduleId: quiz.moduleId,
          completedDays: [],
          attemptedQuizIds: [],
          quizScores: [],
        });
      } catch (createErr) {
        if (createErr.code === 11000) {
          console.log(`>>> [PROGRESS_RACE] Record created by another request, fetching...`);
          progress = await Progress.findOne({
            userId: req.user._id,
            moduleId: quiz.moduleId,
          });
        } else {
          console.error(`>>> [CREATE_ERR]`, createErr);
          throw new Error(`[CREATE_ERR] ${createErr.message}`);
        }
      }
    }

    if (!progress) {
      console.log(`>>> [INIT_ERR] Failed to initialize progress record after checks`);
      throw new Error("[INIT_ERR] Failed to initialize progress record.");
    }

    // 2. Check if already attempted
    const alreadyAttempted = progress.attemptedQuizIds.some(
      (id) => id && id.toString() === quiz._id.toString(),
    );

    if (alreadyAttempted) {
      console.log(`>>> [CONFLICT] User already attempted Quiz ${quiz._id}`);
      return res
        .status(409)
        .json({ message: "[CONFLICT] This quiz can only be submitted once." });
    }

    // 3. Update progress record
    console.log(`>>> [UPDATING_PROGRESS] Adding quiz score and day completion`);
    progress.attemptedQuizIds.push(quiz._id);
    if (quiz.dayId) {
      progress.completedDays.addToSet(quiz.dayId);
      progress.quizScores.push({
        dayId: quiz.dayId,
        score,
        userAnswers,
      });
    }

    try {
      await progress.save();
      console.log(`>>> [SAVE_SUCCESS] Progress saved`);
    } catch (saveErr) {
      console.error(`>>> [SAVE_ERR]`, saveErr);
      throw new Error(`[SAVE_ERR] ${saveErr.message}`);
    }

    // 4. Update user total score
    console.log(`>>> [UPDATING_USER] Incrementing score by ${score}`);
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { totalScore: score } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      console.log(`>>> [AUTH_ERR] User not found during findByIdAndUpdate`);
      return res
        .status(401)
        .json({ message: "[AUTH_ERR] User not found during update." });
    }

    console.log(`>>> [LB_UPDATE] Attempting leaderboard updates`);
    // 5. Leaderboard updates (non-critical)
    try {
      await updateLeaderboardEntry({
        user: updatedUser,
        moduleId: quiz.moduleId,
        score,
      });

      await updateLeaderboardEntry({
        user: updatedUser,
        moduleId: null,
        score,
      });
    } catch (lbError) {
      console.error("Leaderboard update failed:", lbError.message);
    }

    console.log(`>>> [SUBMIT_DONE] Success`);
    res.status(201).json({
      message: "Quiz submitted successfully.",
      score,
      maxScore,
      userTotalScore: updatedUser.totalScore,
      percentage: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100),
    });
  } catch (error) {
    console.error(">>> [FATAL_ERR] Quiz submission error:", error);
    res
      .status(400)
      .json({ 
        message: `Submission failed: ${error.message}`, 
        error: error.message 
      });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(serializeQuiz(quiz));
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create quiz.", error: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid quiz id." });
  }

  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json(serializeQuiz(quiz));
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update quiz.", error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid quiz id." });
  }

  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json({ message: "Quiz deleted." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete quiz.", error: error.message });
  }
};
