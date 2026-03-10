const router = require("express").Router();
const tradeCtrl = require("../Controller/tradeCtrl");
const { verifyToken } = require("../middleware/auth");

router.post("/trade", verifyToken, tradeCtrl.trade);
router.get("/getPropTrade/:propId", verifyToken, tradeCtrl.getTradeByPropId);
router.get("/getChartData/:propId", verifyToken, tradeCtrl.getChartData);

module.exports = router;
