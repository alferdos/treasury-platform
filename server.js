require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// ─── App config ───────────────────────────────────────────────────────────────
const app = express();

// F-07 FIX: Security headers via Helmet
app.use(helmet({
	contentSecurityPolicy: false, // disabled to allow React SPA inline scripts
	crossOriginEmbedderPolicy: false,
}));

// F-08 FIX: Restrict CORS to known origins only
const allowedOrigins = [
	"https://platform.treasury.sa",
	"http://localhost:3000",
	"http://localhost:5000",
];
app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (mobile apps, curl, Postman in dev)
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		callback(new Error(`CORS: Origin ${origin} not allowed`));
	},
	credentials: true,
}));

// F-09 FIX: Rate limiting on auth endpoints to prevent brute-force
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // max 20 login attempts per 15 min per IP
	message: { status: 0, msg: "Too many login attempts. Please try again in 15 minutes." },
	standardHeaders: true,
	legacyHeaders: false,
});

const generalLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 200, // max 200 requests per minute per IP
	message: { status: 0, msg: "Too many requests. Please slow down." },
	standardHeaders: true,
	legacyHeaders: false,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } })); // 10MB limit

// Apply general rate limiter to all API routes
app.use("/api", generalLimiter);

// Apply strict rate limiter to auth endpoints
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/forgot_password", authLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString(), version: "2.1.0-SECURITY" });
});

// Disable caching for API routes
app.use("/api", (req, res, next) => {
	res.set("Cache-Control", "no-cache, no-store, must-revalidate");
	res.set("Pragma", "no-cache");
	res.set("Expires", "0");
	next();
});

// API Routes - MUST be registered before static file serving
app.use("/api", require("./Routes/userRoutes"));
app.use("/api", require("./Routes/propertyRoutes"));
app.use("/api", require("./Routes/deployRoutes"));
app.use("/api", require("./Routes/requestFundRoutes"));
app.use("/api", require("./Routes/transactionRoutes"));
app.use("/api", require("./Routes/tradeRoutes"));
app.use("/api", require("./Routes/adminRoutes"));
app.use("/api", require("./Routes/seedRoutes"));

// 404 handler for unmatched API routes
app.use("/api", (req, res) => {
	res.status(404).json({ error: "API endpoint not found" });
});

// F-11 FIX: Global error handler — never expose stack traces in production
app.use((err, req, res, next) => {
	const isDev = process.env.NODE_ENV !== "production";
	console.error("[ERROR]", err.message, isDev ? err.stack : "");
	res.status(err.status || 500).json({
		status: 0,
		msg: isDev ? err.message : "An internal server error occurred.",
	});
});

mongoose.connect(
	process.env.CONNECTION_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	(err) => {
		if (err) throw err;
		console.log("connected to mongodb");
	},
);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "frontend", "build"), {
		maxAge: "1d",
		etag: false,
		setHeaders: (res, filePath) => {
			if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
				res.setHeader('Content-Type', 'image/jpeg');
			} else if (filePath.endsWith('.png')) {
				res.setHeader('Content-Type', 'image/png');
			} else if (filePath.endsWith('.gif')) {
				res.setHeader('Content-Type', 'image/gif');
			} else if (filePath.endsWith('.webp')) {
				res.setHeader('Content-Type', 'image/webp');
			}
		}
	}));

	app.get("*", (req, res) => {
		if (req.path.startsWith("/api")) {
			return res.status(404).json({ error: "API endpoint not found" });
		}
		res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
	});
}

const port = process.env.PORT;
app.listen(port, () => {
	console.log(`🚀 Treasury Platform v2.1.0 (Security Hardened) — port ${port}`);
});
