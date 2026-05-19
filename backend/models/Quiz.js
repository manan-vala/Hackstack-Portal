const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
	{
		moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
		dayId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
		questions: [
			{
				question: { type: String, required: true },
				options: [{ type: String, required: true }],
				correctIndex: { type: Number, required: true },
				points: { type: Number, required: true }
			}
		]
	},
	{ timestamps: true }
);

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);