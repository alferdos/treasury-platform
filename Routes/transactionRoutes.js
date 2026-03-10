const router = require("express").Router();
const transactionCtrl = require("../Controller/transactionCtrl");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// ─── Authenticated user routes ────────────────────────────────────────────────
router.post("/buy", verifyToken, transactionCtrl.buy);
router.post("/sell", verifyToken, transactionCtrl.sell);
router.get("/getUserTransaction/:userId", verifyToken, transactionCtrl.getTransactionByUserId);
router.get("/getUserBalance/:userId", verifyToken, transactionCtrl.getBalanceByUserId);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.get("/allTransaction", verifyToken, verifyAdmin, transactionCtrl.allTransaction);
router.get("/getPropTransaction/:propId", verifyToken, verifyAdmin, transactionCtrl.getTransactionByPropId);

module.exports = router;
