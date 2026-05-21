const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildRankedResponse = (entries) =>
  entries.map((entry, index) => ({
    ...entry,
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
  return listLeaderboard(req, res, req.params.moduleId);
};