require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Leaderboard = require("../models/Leaderboard");

const run = async () => {
  try {
    await connectDB();
    console.log("🧹 Clearing all user accounts, progress records, and leaderboard entries from the database...");

    const userRes = await User.deleteMany({});
    console.log(`Deleted ${userRes.deletedCount} users.`);

    const progressRes = await Progress.deleteMany({});
    console.log(`Deleted ${progressRes.deletedCount} progress records.`);

    const leaderboardRes = await Leaderboard.deleteMany({});
    console.log(`Deleted ${leaderboardRes.deletedCount} leaderboard entries.`);

    console.log("✨ Done clearing data.");
  } catch (error) {
    console.error("❌ Error clearing database data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
};

run();
