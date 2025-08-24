const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Signup controller

const signup = async (req,res) => {
    const {email ,username ,  password } = req.body;
    try {
      console.log("Incoming Signup Data:", req.body);
        // Check if the user already exist
        const existingUser = await User.findOne({ email });
        if (existingUser){
          console.log("User already exists");
            return res.status(400).json({ error : "User already Exist!"});
        }
        // Hash the password and save the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email , username , password : hashedPassword});
        await newUser.save();
        console.log("User Saved:", newUser);

        res.status(201).json({ message : "User Created!" , user : newUser});
    } catch (error) {
      console.error("Signup Error:", error);
        res.status(500).json({ error : "Error creating user!"})
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

module.exports = { signup, login , getUserData};
