const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Remove deprecated options
        await mongoose.connect(process.env.MONGO_URI); // No need to pass options here

        console.log("Connected successfully to MongoDB");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
