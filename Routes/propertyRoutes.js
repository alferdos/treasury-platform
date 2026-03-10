const router = require("express").Router();
const propertyCtrl = require("../Controller/propertyCtrl");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/get_property", propertyCtrl.getProperty);
router.get("/get_property/:id", propertyCtrl.getPropertyById);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.post("/create_property", verifyToken, verifyAdmin, propertyCtrl.createProperty);
router.post("/update_property", verifyToken, verifyAdmin, propertyCtrl.updateProperty);
router.post("/upload", verifyToken, verifyAdmin, propertyCtrl.upload);
router.post("/uploadPropertyImages", verifyToken, verifyAdmin, propertyCtrl.uploadPropertyImages);
router.post("/delete_property", verifyToken, verifyAdmin, propertyCtrl.deleteProperty);
router.post("/updatePropertyFile", verifyToken, verifyAdmin, propertyCtrl.updatePropertyFile);
router.post("/changeData", verifyToken, verifyAdmin, propertyCtrl.changeData);

module.exports = router;
