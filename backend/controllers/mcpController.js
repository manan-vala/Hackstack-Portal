const mongoose = require('mongoose');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Leaderboard = require('../models/Leaderboard');

const TOOLS = [
	{
		name: "list_modules",
		description: "List all published learning modules on Hackstack. Returns title, slug, description, difficulty, week number, and learning outcomes. Does not include full chapter/day content.",
		inputSchema: { type: "object", properties: {}, required: [] },
		annotations: { readOnly: true }
	},
	{
		name: "get_module",
		description: "Get a single module by its slug, including all chapters, days, Markdown content, video URLs, and final task. Use list_modules first to find available slugs.",
		inputSchema: {
			type: "object",
			properties: {
				slug: { type: "string", description: "The module's unique slug identifier, e.g. 'intro-to-ml'" }
			},
			required: ["slug"]
		},
		annotations: { readOnly: true, "x-mcp-max-output-bytes": 524288 }
	},
	{
		name: "list_quizzes",
		description: "List quizzes, optionally filtered by module. Returns moduleId, dayId, and question count for each quiz.",
		inputSchema: {
			type: "object",
			properties: {
				moduleId: { type: "string", description: "Optional MongoDB ObjectId to filter quizzes for a specific module." }
			},
			required: []
		},
		annotations: { readOnly: true }
	},
	{
		name: "get_quiz",
		description: "Get the full quiz for a specific day within a module. Returns all questions, options, the correct answer index, and points per question.",
		inputSchema: {
			type: "object",
			properties: {
				moduleId: { type: "string", description: "MongoDB ObjectId of the parent module." },
				dayId: { type: "string", description: "MongoDB ObjectId of the specific day." }
			},
			required: ["moduleId", "dayId"]
		},
		annotations: { readOnly: true }
	},
	{
		name: "get_leaderboard",
		description: "Get the global or per-module leaderboard. Returns rank, score, username, and avatar URL for each entry. No PII is included.",
		inputSchema: {
			type: "object",
			properties: {
				scope: { type: "string", enum: ["global", "module"], description: "Which leaderboard to fetch." },
				moduleId: { type: "string", description: "Required when scope is 'module'. MongoDB ObjectId of the module." },
				limit: { type: "number", minimum: 1, maximum: 100, default: 20, description: "Max entries to return." }
			},
			required: ["scope"]
		},
		annotations: { readOnly: true }
	}
];

exports.handleInitialize = async (params) => {
	return {
		protocolVersion: "2024-11-05",
		serverInfo: {
			name: "hackstack-mcp",
			version: "1.0.0"
		},
		capabilities: {
			tools: {}
		}
	};
};

exports.handleToolsList = async () => {
	return { tools: TOOLS };
};

exports.handleToolsCall = async (params) => {
	const { name, arguments: args } = params;
	const startTime = Date.now();
	let resultData;

	try {
		switch (name) {
			case 'list_modules':
				resultData = await listModules();
				break;
			case 'get_module':
				resultData = await getModule(args.slug);
				break;
			case 'list_quizzes':
				resultData = await listQuizzes(args.moduleId);
				break;
			case 'get_quiz':
				resultData = await getQuiz(args.moduleId, args.dayId);
				break;
			case 'get_leaderboard':
				resultData = await getLeaderboard(args.scope, args.moduleId, args.limit);
				break;
			default:
				throw { code: -32601, message: `Tool not found: ${name}` };
		}
		
		console.log(`[MCP] tool=${name} inputs=${JSON.stringify(args)} latency=${Date.now() - startTime}ms status=ok`);
		return {
			content: [{ type: "text", text: JSON.stringify(resultData, null, 2) }]
		};
	} catch (error) {
		console.log(`[MCP] tool=${name} inputs=${JSON.stringify(args)} latency=${Date.now() - startTime}ms status=error reason="${error.message || error}"`);
		if (error.code) {
			throw error; // Let JSON-RPC handler catch and format
		}
		// MCP protocol defines error within result if tool executed but failed logically
		return {
			isError: true,
			content: [{ type: "text", text: error.message || String(error) }]
		};
	}
};

// Tool implementations

async function listModules() {
	const modules = await Module.find({ isPublished: true })
		.select('-chapters -__v -tempInfo -showFinalAssessment')
		.lean();
	return modules;
}

async function getModule(slug) {
	if (!slug) throw new Error("slug is required");
	const mod = await Module.findOne({ slug, isPublished: true })
		.select('-__v -tempInfo -showFinalAssessment')
		.lean();
	if (!mod) throw new Error("Module not found");
	return mod;
}

async function listQuizzes(moduleId) {
	const query = {};
	if (moduleId) {
		if (!mongoose.Types.ObjectId.isValid(moduleId)) throw new Error("Invalid moduleId format");
		query.moduleId = moduleId;
	}
	const quizzes = await Quiz.find(query)
		.select('moduleId dayId questions')
		.lean();
	
	// Simplify response so it isn't massive
	return quizzes.map(q => ({
		moduleId: q.moduleId,
		dayId: q.dayId,
		questionCount: q.questions ? q.questions.length : 0
	}));
}

async function getQuiz(moduleId, dayId) {
	if (!mongoose.Types.ObjectId.isValid(moduleId) || !mongoose.Types.ObjectId.isValid(dayId)) {
		throw new Error("Invalid moduleId or dayId format");
	}
	const quiz = await Quiz.findOne({ moduleId, dayId })
		.select('-__v -_id')
		.lean();
	if (!quiz) throw new Error("Quiz not found");
	return quiz;
}

async function getLeaderboard(scope, moduleId, limit = 20) {
	const query = { periodType: 'all-time' };
	if (scope === 'module') {
		if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
			throw new Error("Valid moduleId is required when scope is 'module'");
		}
		query.moduleId = moduleId;
	} else {
		query.moduleId = null;
	}

	const lb = await Leaderboard.find(query)
		.sort({ score: -1 })
		.limit(Math.min(limit, 100))
		.select('rank score username avatarUrl periodType -_id')
		.lean();
	
	return lb;
}
