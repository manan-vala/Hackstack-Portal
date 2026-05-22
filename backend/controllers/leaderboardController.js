const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');
const Module = require('../models/Module');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildRankedResponse = (entries) =>
  entries.map((entry, index) => ({
    ...entry,
    userId: entry.userId?.toString?.() || entry.userId,
    moduleId: entry.moduleId?.toString?.() || entry.moduleId,
    totalPoints: entry.totalPoints ?? entry.score ?? 0,
    modulesCompleted: entry.modulesCompleted ?? 0,
    rank: entry.rank ?? index + 1
  }));

const listLeaderboard = async (req, res, moduleId = null) => {
  const periodType = req.query.periodType || 'all-time';
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  if (moduleId && !isValidObjectId(moduleId)) {
    return res.status(400).json({ message: 'Invalid module id.' });
  }

  try {
    const filters = {
      moduleId: moduleId ?? null,
      periodType
    };

    const entries = await Leaderboard.find(filters)
      .sort({ score: -1, createdAt: 1 })
      .limit(limit)
      .lean();

    res.json(buildRankedResponse(entries));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard.', error: error.message });
  }
};

exports.getGlobalLeaderboard = async (req, res) => {
  return listLeaderboard(req, res, null);
};

exports.getModuleLeaderboard = async (req, res) => {
  try {
    const rawModuleId = req.params.moduleId;

    if (isValidObjectId(rawModuleId)) {
      return listLeaderboard(req, res, rawModuleId);
    }

    const moduleDoc = await Module.findOne({ slug: rawModuleId }).select('_id');
    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    return listLeaderboard(req, res, moduleDoc._id.toString());
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch leaderboard.',
      error: error.message
    });
  }
};
