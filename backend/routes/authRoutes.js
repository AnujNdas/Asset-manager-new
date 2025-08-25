const express = require("express");
const { signup , login , getUserData , changePassword} = require('../controllers/authControllers');
const authenticateToken = require("../Middleware/Authentication-token")

const router = express.Router();

// Sign up routes
router.post("/signup", signup);

// Login route 
router.post("/login", login);

// Get user route
router.get("/user", authenticateToken, getUserData);

// change password route 
router.put("/change-password", authenticateToken, changePassword);

module.exports = router
