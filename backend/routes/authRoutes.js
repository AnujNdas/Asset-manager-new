const express = require("express");
const { signup , login , getUserData } = require('../controllers/authControllers');
const authenticateToken = require("../Middleware/Authentication-token")

const router = express.Router();

// Sign up routes
router.post("/signup", signup);

// Login route 
router.post("/login", login);

// Get user route
router.get("/user", authenticateToken, getUserData);

module.exports = router
