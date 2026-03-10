const router = require("express").Router();
const deployCtrl = require("../Controller/deployCtrl");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/getPropBlockchainData/:propId", deployCtrl.getBlockchainDataByPropId);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.post("/deploy", verifyToken, verifyAdmin, deployCtrl.deploy);

module.exports = router;
