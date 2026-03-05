require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
var bodyParser = require("body-parser");
var fs = require("fs");
const fileUpload = require("express-fileupload");

//App config

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(fileUpload());

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString(), version: "1.0.1" });
});

// Version endpoint for cache busting
app.get("/version", (req, res) => {
	res.json({ 
		version: "2.0.0-DEPLOYMENT-FIX",
		timestamp: new Date().toISOString(),
		message: "API routing fix deployed successfully"
	});
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

// 404 handler for unmatched API routes
app.use("/api", (req, res) => {
	res.status(404).json({ error: "API endpoint not found", path: req.path });
});

mongoose.connect(
	process.env.CONNECTION_URL,
	{
		useNewUrlParser: true,
		// useCreateIndex: true,
		useUnifiedTopology: true,
		// useFindAndModify: false,
	},
	(err) => {
		if (err) throw err;
		console.log("connected to mongodb");
	},
);
//listener - Serve frontend in production
if (process.env.NODE_ENV === "production") {
	// Serve static files from frontend/build
	app.use(express.static(path.join(__dirname, "frontend", "build"), {
		maxAge: "1d",
		etag: false
	}));
	
	// Catch-all route for SPA - serves index.html for all non-API routes
	app.get("*", (req, res) => {
		// Don't serve index.html for /api routes - they should have been handled above
		if (req.path.startsWith("/api")) {
			return res.status(404).json({ error: "API endpoint not found", path: req.path });
		}
		// Serve the React app for all other routes
		res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
	});
}

//listener
const port = process.env.PORT;
app.listen(port, () => {
	console.log(`🚀 SERVER STARTED - API ROUTING FIX DEPLOYED - listening port localhost : ${port}`);
});
// Trigger rebuild - Force deployment at Wed Mar 05 2026 14:35:00 GMT+3
// This comment forces Railway to rebuild the application
// Deployment fix: Restructured Express routing to handle API routes correctly
