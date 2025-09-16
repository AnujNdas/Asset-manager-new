const express = require("express");
const { sendOtp, verifyOtpAndSignup, login, getUserData, changePassword } = require("../controllers/authControllers");
const authenticateToken = require("../Middleware/Authentication-token");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp-signup", verifyOtpAndSignup);
router.post("/login", login);
router.get("/user", authenticateToken(["admin", "user" , "super-admin"]), getUserData);
router.put("/change-password", authenticateToken(["admin" , "user"]), changePassword);

module.exports = router;
