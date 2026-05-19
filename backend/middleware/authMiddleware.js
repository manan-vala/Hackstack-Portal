const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
	try {
		// Extract token from Authorization header or cookie
		let token;
		const authHeader = req.headers.authorization;
		
		if (authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7); // Remove 'Bearer ' prefix
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}
		
		if (!token) {
			return res.status(401).json({ message: 'Authorization header or cookie missing.' });
		}

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
