const express = require("express");
const { sendOtp, verifyOtpAndSignup, login, getUserData, changePassword ,forgotPassword , resetPassword } = require("../controllers/authControllers");
const authenticateToken = require("../Middleware/Authentication-token");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp-signup", verifyOtpAndSignup);
router.post("/login", login);
router.get("/user", authenticateToken(), getUserData);
router.put("/change-password", authenticateToken(), changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

