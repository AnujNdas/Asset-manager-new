const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Signup controller

const signup = async (req,res) => {
    const {name , username , password } = req.body;
    try {
        // Check if the user already exist
        const existingUser = await User.findOne({ username });
        if (existingUser){
            return res.status(400).json({ error : "User already Exist!"});
        }
        // Hash the password and save the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name , username , password : hashedPassword});
        await newUser.save();

        res.status(201).json({ message : "User Created!"});
    } catch (error) {
        res.status(500).json({ error : "Error creating user!"})
    }
};

// Login controller

const login = async (req,res) => {
    const { username , password} = req.body;
    try {
        // Find the user in the database
        const user = await User.findOne({ username});
        if (!user) return res.status(404).json({ error : "User not found!"});

        // Verify the password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({error : "Invalid Password!"});

        // Generate a Token 
        const token = jwt.sign({ username : user.username },
            "jwt_secret", { expiresIn : "1hr"});
            res.json({ message : "Logged in!", token});
    } catch (error) {
        res.status(500).json({ error : "Error logging in!"});
    }
};

module.exports = { signup, login};