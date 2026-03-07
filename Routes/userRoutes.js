const router = require("express").Router();
const userController = require("../Controller/userCtrl");

router.post("/login", userController.login);
router.post("/register", userController.register);
router.post("/forgot_password", userController.forgot_password);
router.post("/logout", userController.logout);
router.post("/refresh_token", userController.refreshToken);
router.post("/update_profile", userController.updateProfile);
router.post("/update_profilePic", userController.updateProfilePic);
router.get("/get_user", userController.getUser);
router.get("/get_user/:id", userController.getUserById);
router.post("/delete_user", userController.deleteUser);
router.post("/sendTokenByAdmin", userController.sendTokenByAdmin);
router.post("/sendTokenByUser", userController.sendTokenByUser);
router.post("/addFunds", userController.addFunds);
router.get("/getUserDetail/:userId", userController.getUserDetail);
router.get("/getAdminAnalytics", userController.getAdminAnalytics);

router.post("/cronJobUploadRecord", userController.cronJobUploadRecord);
router.post("/cronJobSearchRecord", userController.cronJobSearchRecord);
router.post("/cronJobFetchRecord", userController.cronJobFetchRecord);

module.exports = router;
