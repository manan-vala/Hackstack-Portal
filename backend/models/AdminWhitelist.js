const mongoose = require('mongoose');

const adminWhitelistSchema = new mongoose.Schema(
  {
    githubUsername: { type: String, required: true, unique: true, lowercase: true },
    canDelete: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.models.AdminWhitelist || mongoose.model('AdminWhitelist', adminWhitelistSchema);
