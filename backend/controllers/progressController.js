const mongoose = require('mongoose');
const Progress = require('../models/Progress');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.listProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate('userId', 'username email')
      .populate('moduleId', 'title slug')
      .sort({ createdAt: -1 });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch progress records.', error: error.message });
  }
};

exports.getProgress = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid progress id.' });
  }

  try {
    const progress = await Progress.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('moduleId', 'title slug');

    if (!progress) return res.status(404).json({ message: 'Progress record not found.' });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch progress record.', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid progress id.' });
  }

  try {
    // Fetch the progress record first to verify ownership
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: 'Progress record not found.' });

    // Enforce ownership: users can only update their own progress
    if (progress.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own progress.' });
    }

    // Update progress record
    const updatedProgress = await Progress.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updatedProgress);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update progress record.', error: error.message });
  }
};
