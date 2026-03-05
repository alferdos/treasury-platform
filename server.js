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
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

//routes
app.use("/api", require("./Routes/userRoutes"));
app.use("/api", require("./Routes/propertyRoutes"));
app.use("/api", require("./Routes/deployRoutes"));
app.use("/api", require("./Routes/requestFundRoutes"));
app.use("/api", require("./Routes/transactionRoutes"));
app.use("/api", require("./Routes/tradeRoutes"));
app.use("/api", require("./Routes/adminRoutes"));

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
//listener
if (process.env.NODE_ENV === "production") {
	app.use(express.static("frontend/build"));
	// Catch-all route for SPA - but NOT for /api routes
	app.get("*", (req, res) => {
		// Don't serve index.html for API routes
		if (req.path.startsWith("/api")) {
			return res.status(404).json({ error: "API route not found" });
		}
		res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
	});
}

//listener
const port = process.env.PORT;
app.listen(port, () => {
	console.log(`listening port localhost : ${port}`);
});
// Trigger rebuild at Thu Mar  5 03:21:11 EST 2026
// Trigger rebuild at Thu Mar  5 05:15:44 EST 2026
// Trigger rebuild
