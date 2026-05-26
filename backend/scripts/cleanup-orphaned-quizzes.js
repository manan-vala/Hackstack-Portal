/**
 * cleanup-orphaned-quizzes.js
 *
 * One-off script: deletes all Quiz documents whose moduleId no longer
 * references an existing Module (left behind by module deletions that
 * didn't cascade to the Quiz collection).
 *
 * Usage:
 *   node scripts/cleanup-orphaned-quizzes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');

(async () => {
  await connectDB();

  const existingModuleIds = await Module.distinct('_id');
  console.log(`Found ${existingModuleIds.length} existing module(s).`);

  const result = await Quiz.deleteMany({ moduleId: { $nin: existingModuleIds } });
  console.log(`Deleted ${result.deletedCount} orphaned quiz(zes).`);

  await mongoose.disconnect();
  process.exit(0);
})();
