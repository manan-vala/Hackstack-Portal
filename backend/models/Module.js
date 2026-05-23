const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
		chapters: [
			{
				title: { type: String, required: true },
				days: [
					{
						title: { type: String, required: true },
						contentMarkdown: { type: String, default: '' },
						videoUrl: [{ type: String }]
					}
				]
			}
		],
		isPublished: { type: Boolean, default: false },
		difficulty: { type: String },
		week: { type: Number },
		learningOutcomes: [{ type: String }],
		finalTask: { type: String, default: '' }
	},
	{ timestamps: true }
);

module.exports = mongoose.models.Module || mongoose.model('Module', moduleSchema);