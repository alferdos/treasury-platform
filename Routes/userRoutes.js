const router = require("express").Router();
const userController = require("../Controller/userCtrl");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// ─── Public routes (no auth required) ────────────────────────────────────────
router.post("/login", userController.login);
router.post("/register", userController.register);
router.post("/forgot_password", userController.forgot_password);
router.post("/logout", userController.logout);
router.post("/refresh_token", userController.refreshToken);

// ─── Authenticated user routes ────────────────────────────────────────────────
router.post("/update_profile", verifyToken, userController.updateProfile);
router.post("/update_profilePic", verifyToken, userController.updateProfilePic);
router.get("/get_user", verifyToken, userController.getUser);
router.get("/get_user/:id", verifyToken, userController.getUserById);
router.post("/sendTokenByUser", verifyToken, userController.sendTokenByUser);
router.post("/cronJobSearchRecord", verifyToken, userController.cronJobSearchRecord);
router.post("/cronJobFetchRecord", verifyToken, userController.cronJobFetchRecord);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.post("/delete_user", verifyToken, verifyAdmin, userController.deleteUser);
router.post("/sendTokenByAdmin", verifyToken, verifyAdmin, userController.sendTokenByAdmin);
router.post("/addFunds", verifyToken, verifyAdmin, userController.addFunds);
router.get("/getUserDetail/:userId", verifyToken, verifyAdmin, userController.getUserDetail);
router.get("/getAdminAnalytics", verifyToken, verifyAdmin, userController.getAdminAnalytics);
router.get("/getBlockchainOverview", verifyToken, verifyAdmin, userController.getBlockchainOverview);
router.post("/cronJobUploadRecord", verifyToken, verifyAdmin, userController.cronJobUploadRecord);

module.exports = router;
