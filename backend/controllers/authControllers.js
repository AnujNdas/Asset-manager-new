const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signup = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    console.log("Incoming Signup Data:", req.body);

    // Validate fields
    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("Email already exists");
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log("Username already exists");
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("User Saved:", newUser);

    res.status(201).json({
      message: "User Created!",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};


// Login controller

const login = async (req,res) => {
    const { email , password} = req.body;
    try {
        // Find the user in the database
        const user = await User.findOne({ email});
        if (!user) return res.status(404).json({ error : "User not found!"});

        // Verify the password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({error : "Invalid Password!"});

        // Generate a Token 
        const token = jwt.sign({ email : user.email,id: user._id },
            "jwt_secret", { expiresIn : "1h"});
            res.json({ message : "Logged in!", token});
    } catch (error) {
        res.status(500).json({ error : "Error logging in!"});
    }
};

const getUserData = async (req, res) => {
    try {
      const user = await User.findById(req.user.id); // using ID from token // Get the user by the username from the decoded token
      
      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }
  
      // Exclude password from the response for security reasons
      const { password, ...userData } = user.toObject();
  
      res.json(userData);  // Send the user data back to the client
    } catch (error) {
      res.status(500).json({ error: "Error fetching user data" });
    }
  };

// Change Password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Coming from authenticateToken middleware
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required." });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ error: "Server error while changing password." });
  }
};
module.exports = { signup, login , getUserData , changePassword};
