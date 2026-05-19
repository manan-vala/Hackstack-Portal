const mongoose = require("mongoose");
const User = require("../models/User");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("registeredModules", "title slug")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users.", error: error.message });
  }
};

exports.getUser = async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid user id." });

  try {
    const user = await User.findById(req.params.id).populate(
      "registeredModules",
      "title slug",
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user.", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create user.", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid user id." });

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update user.", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid user id." });

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user.", error: error.message });
  }
};

exports.githubLogin = async (req, res) => {
  const { code } = req.body;

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubData = userResponse.data;

    let user = await User.findOne({ githubId: githubData.id.toString() });

    if (!user) {
      user = await User.create({
        githubId: githubData.id.toString(),
        username: githubData.login,
        email: githubData.email || "no-email-provided",
        avatarUrl: githubData.avatar_url,
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "GitHub authentication failed" });
  }
};
