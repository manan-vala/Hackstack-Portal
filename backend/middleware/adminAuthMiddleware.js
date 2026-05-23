const jwt = require('jsonwebtoken');

/**
 * Admin-specific auth middleware.
 *
 * Admin authentication is entirely credential-based (username + password against
 * environment variables). There is NO MongoDB User record for admins.
 *
 * This middleware:
 *  - Only reads from the "Authorization: Bearer <token>" header (never cookies)
 *  - Verifies the JWT signature
 *  - Confirms the "isAdmin: true" claim in the payload
 *  - Does NOT perform any database lookup
 *
 * This guarantees admin sessions are completely isolated from the user frontend,
 * which relies on HttpOnly cookies tied to GitHub OAuth user records.
 */
const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Admin authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    // Attach a lightweight admin identity to req (no DB record exists)
    req.admin = { username: decoded.username, isAdmin: true, canDelete: !!decoded.canDelete };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};

module.exports = adminAuth;
