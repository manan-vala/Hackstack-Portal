const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		githubId: { type: String, required: true, unique: true },
		username: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		avatarUrl: { type: String },
		registeredModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
		isAdmin: { type: Boolean, default: false },
		totalScore: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);