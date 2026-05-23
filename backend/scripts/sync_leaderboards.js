require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Leaderboard = require("../models/Leaderboard");
const Progress = require("../models/Progress");
const User = require("../models/User");
const Module = require("../models/Module");

const sync = async () => {
  await connectDB();
  console.log("Starting leaderboard synchronization...");

  // 1. Clear existing all-time entries
  await Leaderboard.deleteMany({ periodType: "all-time" });
  console.log("Cleared old all-time leaderboards.");

  // Fetch active module IDs to filter out deleted module progress
  const activeModules = await Module.find({});
  const activeModuleIds = new Set(activeModules.map(m => m._id.toString()));
  
  // Auto-clean orphaned progress entries
  await Progress.deleteMany({ moduleId: { $nin: Array.from(activeModuleIds) } });

  const users = await User.find({});
  const progressList = await Progress.find({});
  console.log(`Found ${users.length} users and ${progressList.length} progress records.`);

  const userGlobalScores = {};

  // Sync module-specific entries from Progress collection and sum them up
  for (const progress of progressList) {
    if (!progress.moduleId || !activeModuleIds.has(progress.moduleId.toString())) {
      continue; // Skip progress of deleted modules
    }

    const user = users.find(u => u._id.toString() === progress.userId.toString());
    if (!user) {
      console.log(`Skipping progress for unknown user ${progress.userId}`);
      continue;
    }

    const moduleScore = (progress.quizScores || []).reduce((sum, item) => sum + (item.score || 0), 0);
    if (moduleScore > 0) {
      await Leaderboard.create({
        userId: user._id,
        moduleId: progress.moduleId,
        score: moduleScore,
        username: user.username,
        avatarUrl: user.avatarUrl,
        periodType: "all-time"
      });
      console.log(`Synced module leaderboard entry for ${user.username} (module ${progress.moduleId}) with score ${moduleScore}`);
      
      const userIdStr = user._id.toString();
      userGlobalScores[userIdStr] = (userGlobalScores[userIdStr] || 0) + moduleScore;
    }
  }

  // Sync global entries based on sum of modules
  for (const user of users) {
    const userIdStr = user._id.toString();
    const computedScore = userGlobalScores[userIdStr] || 0;
    if (computedScore > 0) {
      await Leaderboard.create({
        userId: user._id,
        moduleId: null,
        score: computedScore,
        username: user.username,
        avatarUrl: user.avatarUrl,
        periodType: "all-time"
      });
      console.log(`Synced global leaderboard entry for ${user.username} with module-sum score ${computedScore}`);
    }
  }

  console.log("✅ Leaderboard synchronization completed successfully.");
  await mongoose.disconnect();
};

sync().catch(err => {
  console.error("Sync failed:", err);
  process.exit(1);
});
