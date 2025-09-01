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

// ✅ Map userId -> socketId for private notifications
const userSocketMap = {};

// ✅ Handle socket connection
io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // Listen for user registration (after login)
    socket.on("register", (userId) => {
        if (userId) {
            userSocketMap[userId] = socket.id;
            console.log(`✅ User ${userId} registered with socket ID ${socket.id}`);
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
        for (let userId in userSocketMap) {
            if (userSocketMap[userId] === socket.id) {
                delete userSocketMap[userId];
                console.log(`❌ Removed mapping for user ${userId}`);
                break;
            }
        }
    });
});

// ✅ Make io and userSocketMap accessible in routes
app.set("io", io);
app.set("userSocketMap", userSocketMap);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
