const express = require("express");
const {resetPreview , resetSystemData ,  sendOtp, verifyOtpAndSignup,completeOnboarding, login, getUserData, changePassword ,forgotPassword , resetPassword } = require("../controllers/authControllers");
const authenticateToken = require("../Middleware/Authentication-token");
const { applyAffiliate } = require("../controllers/affiliate/applyAffiliate");
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp-signup", verifyOtpAndSignup);
router.post("/login", login);
router.post("/affiliate/apply", applyAffiliate);
router.get("/user", authenticateToken(), getUserData);
router.put("/change-password", authenticateToken(), changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/complete-onboarding", completeOnboarding);
router.post("/reset-system-data", authenticateToken(), resetSystemData);
router.get("/reset-preview", authenticateToken(), resetPreview);
module.exports = router;

