const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		googleId: { type: String, required: true, unique: true },
		name: { type: String, default: '' },
		username: { type: String, default: '' },
		email: { type: String, required: true, unique: true },
		avatarUrl: { type: String },
		college: { type: String, default: '' },
		year: { type: String, default: '' },
		mobileNumber: { type: String, default: '' },
		profileCompleted: { type: Boolean, default: false },
		registeredModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
		totalScore: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

// Only enforce uniqueness on username when it's actually set (non-empty)
userSchema.index(
	{ username: 1 },
	{ unique: true, partialFilterExpression: { username: { $gt: '' } } }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);