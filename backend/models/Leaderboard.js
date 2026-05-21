const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  // Reference to the user
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Optional: null indicates a 'Global' leaderboard, 
  // while an ID links it to a specific course/module.
  moduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Module', 
    default: null 
  },
  
  // Score achieved for this specific scope (Global or Module)
  score: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  
  // The calculated rank (can be updated via a daily/hourly cron job or on quiz completion)
  rank: { 
    type: Number 
  },
  // Cached display fields to avoid joins when serving leaderboards
  username: { type: String },
  avatarUrl: { type: String },
  
  // Timeframe tracking (useful if you want to expand to 'Weekly' or 'Monthly' challenges)
  periodType: {
    type: String,
    enum: ['all-time', 'monthly', 'weekly'],
    default: 'all-time'
  }
}, { timestamps: true });

// Ensure a user has exactly one entry per module/global scope per period
leaderboardSchema.index({ userId: 1, moduleId: 1, periodType: 1 }, { unique: true });

// Indexing for high-performance sorting when pulling leaderboard lists
leaderboardSchema.index({ moduleId: 1, score: -1 });

module.exports = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);