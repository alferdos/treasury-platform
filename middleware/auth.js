const jwt = require("jsonwebtoken");

/**
 * verifyToken — Authentication middleware
 * Validates the JWT access token sent in the Authorization header.
 * Usage: router.use(verifyToken) or router.post("/route", verifyToken, handler)
 */
const verifyToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

	if (!token) {
		return res.status(401).json({ status: 0, msg: "Access denied. No token provided." });
	}

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ status: 0, msg: "Invalid or expired token. Please login again." });
	}
};

/**
 * verifyAdmin — Admin-only middleware
 * Must be used AFTER verifyToken.
 * Checks that the authenticated user has role === 1 (admin).
 */
const verifyAdmin = async (req, res, next) => {
	try {
		const User = require("../Model/userModel");
		const user = await User.findById(req.user.id).select("role");
		if (!user || user.role !== 1) {
			return res.status(403).json({ status: 0, msg: "Access denied. Admin privileges required." });
		}
		req.adminUser = user;
		next();
	} catch (err) {
		return res.status(500).json({ status: 0, msg: "Authorization check failed." });
	}
};

module.exports = { verifyToken, verifyAdmin };
