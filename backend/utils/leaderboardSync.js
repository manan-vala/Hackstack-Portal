const Leaderboard = require("../models/Leaderboard");
const Progress = require("../models/Progress");
const User = require("../models/User");
const Module = require("../models/Module");

const syncLeaderboards = async () => {
  try {
    console.log("🔄 Auto-syncing leaderboards...");
    
    // Clear old all-time leaderboards
    await Leaderboard.deleteMany({ periodType: "all-time" });
    
    // Fetch active module IDs to filter out deleted module progress
    const activeModules = await Module.find({});
    const activeModuleIds = new Set(activeModules.map(m => m._id.toString()));
    
    // Auto-clean orphaned progress entries
    await Progress.deleteMany({ moduleId: { $nin: Array.from(activeModuleIds) } });
    
    const users = await User.find({});
    const progressList = await Progress.find({});
    
    const userGlobalScores = {};
    const moduleEntries = [];
    
    // Calculate module-specific scores and sum them up for global score
    for (const progress of progressList) {
      if (!progress.moduleId || !activeModuleIds.has(progress.moduleId.toString())) {
        continue; // Skip progress of deleted modules
      }
      
      const userIdStr = progress.userId.toString();
      const user = users.find(u => u._id.toString() === userIdStr);
      if (!user) continue;
      
      const moduleScore = (progress.quizScores || []).reduce((sum, item) => sum + (item.score || 0), 0);
      if (moduleScore > 0) {
        moduleEntries.push({
          userId: user._id,
          moduleId: progress.moduleId,
          score: moduleScore,
          username: user.username,
          avatarUrl: user.avatarUrl,
          periodType: "all-time"
        });
        
        userGlobalScores[userIdStr] = (userGlobalScores[userIdStr] || 0) + moduleScore;
      }
    }
    
    // Generate global entries based on the computed totals
    const globalEntries = [];
    for (const user of users) {
      const userIdStr = user._id.toString();
      const computedScore = userGlobalScores[userIdStr] || 0;
      if (computedScore > 0) {
        globalEntries.push({
          userId: user._id,
          moduleId: null,
          score: computedScore,
          username: user.username,
          avatarUrl: user.avatarUrl,
          periodType: "all-time"
        });
      }
    }
      
    if (globalEntries.length > 0) {
      await Leaderboard.insertMany(globalEntries);
    }
    
    if (moduleEntries.length > 0) {
      await Leaderboard.insertMany(moduleEntries);
    }
    
    console.log(`✅ Leaderboards synced. Global entries: ${globalEntries.length}, Module entries: ${moduleEntries.length}`);
  } catch (error) {
    console.error("❌ Auto-syncing leaderboards failed:", error.message);
  }
};

module.exports = syncLeaderboards;
