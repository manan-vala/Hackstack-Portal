const mongoose = require('mongoose');
const Module = require('../models/Module');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getModuleUploadDeadline = (moduleDoc) => {
  if (!moduleDoc?.createdAt) return null;

  const deadline = new Date(moduleDoc.createdAt);
  deadline.setUTCHours(23, 59, 59, 999);
  return deadline;
};

const serializeModule = (moduleDoc) => {
  const uploadDeadline = getModuleUploadDeadline(moduleDoc);
  const now = new Date();

  return {
    ...moduleDoc.toObject(),
    uploadDeadline,
    isExpired: uploadDeadline ? now > uploadDeadline : false
  };
};

exports.listModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ week: 1, createdAt: 1 });
    res.json(modules.map(serializeModule));
  } catch (error) {
    res.status(500).json({ message: 'Failed to list modules.', error: error.message });
  }
};

exports.getModuleById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid module id.' });
  }

  try {
    const moduleDoc = await Module.findById(req.params.id);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found.' });
    res.json(serializeModule(moduleDoc));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch module.', error: error.message });
  }
};

exports.getModuleBySlug = async (req, res) => {
  try {
    const moduleDoc = await Module.findOne({ slug: req.params.slug });
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found.' });
    res.json(serializeModule(moduleDoc));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch module.', error: error.message });
  }
};

exports.registerModule = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid module id.' });
  }

  try {
    const moduleDoc = await Module.findById(req.params.id);
    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { registeredModules: moduleDoc._id } },
      { new: true, runValidators: true }
    ).populate('registeredModules', 'title slug');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: moduleDoc._id },
      { $setOnInsert: { userId: req.user._id, moduleId: moduleDoc._id } },
      { upsert: true, new: true }
    );

    res.json({ message: 'Success', user, module: moduleDoc });
  } catch (error) {
    res.status(400).json({ message: 'Failed to register module.', error: error.message });
  }
};

exports.unregisterModule = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid module id.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { registeredModules: req.params.id } },
      { new: true, runValidators: true }
    ).populate('registeredModules', 'title slug');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'Unregistered successfully.', user });
  } catch (error) {
    res.status(400).json({ message: 'Failed to unregister module.', error: error.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const moduleDoc = await Module.create(req.body);
    res.status(201).json(serializeModule(moduleDoc));
  } catch (error) {
    res.status(400).json({ message: 'Failed to create module.', error: error.message });
  }
};

exports.updateModule = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid module id.' });
  }

  try {
    const moduleDoc = await Module.findById(req.params.id);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found.' });

    moduleDoc.set(req.body);
    await moduleDoc.save();

    const freshModule = await Module.findById(req.params.id);
    res.json(serializeModule(freshModule));
  } catch (error) {
    res.status(400).json({ message: 'Failed to update module.', error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  const moduleId = req.params.id;
  if (!isValidObjectId(moduleId)) {
    return res.status(400).json({ message: 'Invalid module id.' });
  }

  try {
    // 1. Find progress records to subtract scores from users
    const progressList = await Progress.find({ moduleId });
    for (const progress of progressList) {
      const moduleScore = (progress.quizScores || []).reduce((sum, item) => sum + (item.score || 0), 0);
      if (moduleScore > 0) {
        // Subtract from user totalScore
        await User.findByIdAndUpdate(progress.userId, {
          $inc: { totalScore: -moduleScore }
        });
      }
    }

    // 2. Delete progress records for the deleted module
    await Progress.deleteMany({ moduleId });

    // 3. Remove the module from any users' registeredModules list
    await User.updateMany(
      { registeredModules: moduleId },
      { $pull: { registeredModules: moduleId } }
    );

    // 4. Delete the leaderboard entries for the deleted module
    const Leaderboard = require('../models/Leaderboard');
    await Leaderboard.deleteMany({ moduleId });

    // 5. Delete all quizzes belonging to this module
    await Quiz.deleteMany({ moduleId });

    // 6. Delete the module itself
    const moduleDoc = await Module.findByIdAndDelete(moduleId);
    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    // 7. Recalculate/Sync all leaderboards
    const syncLeaderboards = require('../utils/leaderboardSync');
    await syncLeaderboards();

    res.json({ message: 'Module and associated progress/scores deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete module.', error: error.message });
  }
};

// Backwards-compatible alias expected by admin routes
exports.getModule = exports.getModuleById;
