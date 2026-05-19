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
    return next(); // ✅ Added 'return' here to stop execution
    
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed." });
  }
};

module.exports = auth;