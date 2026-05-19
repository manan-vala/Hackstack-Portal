const User = require('../models/User');

const admin = async (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ message: 'Authentication required.' });
	}

	try {
		const user = await User.findById(req.user._id);
		if (!user || !user.isAdmin) {
			return res.status(403).json({ message: 'Admin access required.' });
		}
		next();
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = admin;
