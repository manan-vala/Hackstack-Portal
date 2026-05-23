require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Leaderboard = require("../models/Leaderboard");
const User = require("../models/User");

const run = async () => {
  await connectDB();
  console.log("Fetching Leaderboards...");
  const leaderboards = await Leaderboard.find({}).lean();
  console.log("Leaderboard count:", leaderboards.length);
  console.log("Leaderboard entries:", JSON.stringify(leaderboards, null, 2));

  console.log("Fetching Users...");
  const users = await User.find({}).lean();
  console.log("Users count:", users.length);
  console.log("Users:", JSON.stringify(users.map(u => ({ _id: u._id, username: u.username, totalScore: u.totalScore })), null, 2));

  console.log("Fetching Progress...");
  const Progress = require("../models/Progress");
  const progressList = await Progress.find({}).lean();
  console.log("Progress count:", progressList.length);
  console.log("Progress:", JSON.stringify(progressList.map(p => ({ userId: p.userId, moduleId: p.moduleId, scoresCount: p.quizScores?.length })), null, 2));
  
  console.log("Fetching Modules...");
  const Module = require("../models/Module");
  const modulesList = await Module.find({}).lean();
  console.log("Modules count:", modulesList.length);
  console.log("Modules:", JSON.stringify(modulesList.map(m => ({ _id: m._id, title: m.title, isPublished: m.isPublished })), null, 2));

  await mongoose.disconnect();
};

run();
