const express = require("express");
const { signup , login } = require('../controllers/authControllers');

const router = express.Router();

// Sign up routes
router.post("/signup", signup);

// Login route 
router.post("/login", login);

module.exports = router