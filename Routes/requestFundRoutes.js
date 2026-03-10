const router = require("express").Router();
const requestFundCtrl = require("../Controller/requestFundCtrl");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// ─── Authenticated user routes ────────────────────────────────────────────────
router.post("/requestFund", verifyToken, requestFundCtrl.requestFund);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.get("/getRequestFund", verifyToken, verifyAdmin, requestFundCtrl.getRequestFund);
router.post("/approveRequest", verifyToken, verifyAdmin, requestFundCtrl.approveRequest);

module.exports = router;
