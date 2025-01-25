const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const assetsRoutes = require("./routes/assetRoutes");
const authRoutes = require('./routes/authRoutes')
const unitRoutes = require('./routes/unitRoutes')
const locationRoutes = require('./routes/locationRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const statusRoutes = require('./routes/statusRoutes')
const path = require("path");
// Initialize environment variables
dotenv.config();

// Connect to mongodb
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'https://asset-manager-new-frontend.onrender.com', // Frontend domain (Vercel)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
  }));

app.use(bodyParser.json());
// app.use(express.json());  // Instead of bodyParser.json()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use("/api/assets",assetsRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/unit",unitRoutes);
app.use("/api/location",locationRoutes);
app.use("/api/category",categoryRoutes);
app.use("/api/status",statusRoutes);
// Default route
app.get("/",(req,res)=>{
    res.send("Asset management api is running...");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server is running on PORT : ${PORT}`));
