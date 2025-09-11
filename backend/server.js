const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const assetsRoutes = require("./routes/assetRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const authRoutes = require("./routes/authRoutes");
const unitRoutes = require("./routes/unitRoutes");
const locationRoutes = require("./routes/locationRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const statusRoutes = require("./routes/statusRoutes");
const updateRoutes = require("./routes/updateRoutes");
const softwareAssetRoutes = require("./routes/softwareAssets");
const companyLicenseRoutes = require("./routes/coreCompanyLicenses");
const adminRoutes = require("./routes/adminRoutes");
connectDB();

const app = express();

// ✅ Middleware
app.use(cors({
    origin: "https://asset-manager-new-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/user", updateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/unit", unitRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/software-assets", softwareAssetRoutes);
app.use("/api/company-licenses", companyLicenseRoutes);
app.use("/api/admin" , adminRoutes)
app.get("/", (req, res) => {
    res.send("Asset management API is running...");
});

// ✅ Create HTTP server & attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://asset-manager-new-frontend.onrender.com",
        methods: ["GET", "POST"]
    }
});

// ✅ Handle socket connection
io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // Listen for user registration (after login)
socket.on("joinRoom", (userId) => {
  socket.join(userId);
  console.log(`✅ User ${userId} joined room`);
});


    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// ✅ Make io and userSocketMap accessible in routes
app.set("io", io);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
