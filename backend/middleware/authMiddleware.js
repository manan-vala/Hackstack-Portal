const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
	try {
		// Extract token from Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Authorization header missing or invalid.' });
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		
		// Attach decoded user data to request object
		req.user = decoded;
		next();
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token expired. Please log in again.' });
		}
		return res.status(401).json({ message: 'Invalid token.' });
	}
};

module.exports = auth;
