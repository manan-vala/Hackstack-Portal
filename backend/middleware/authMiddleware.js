const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const token = bearerToken || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Not authorized, invalid token." });
    }

    const user = await User.findById(userId).select("-githubId");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, token failed." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id); // Use _id (MongoDB's field) instead of id
    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed." });
  }
};

module.exports = auth;
