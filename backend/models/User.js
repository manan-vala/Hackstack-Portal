const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		githubId: { type: String, required: true, unique: true },
		username: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		avatarUrl: { type: String },
		registeredModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
		totalScore: { type: Number, default: 0 },
		githubAccessToken: { type: String }
	},
	{ timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);