  const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");

// ✅ Import routes
const assetsRoutes = require("./routes/assetRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const authRoutes = require("./routes/authRoutes");
const unitRoutes = require("./routes/unitRoutes");
const locationRoutes = require("./routes/locationRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const statusRoutes = require("./routes/statusRoutes");
const nodemailer = require("nodemailer");
const updateRoutes = require("./routes/updateRoutes");
const softwareAssetRoutes = require("./routes/softwareAssets");
const companyLicenseRoutes = require("./routes/coreCompanyLicenses");
const adminRoutes = require("./routes/adminRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const userRoute = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");



// ✅ Import User model for Super Admin seeding
const User = require("./models/User");

// Connect DB
connectDB();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: "https://assetsmanagementsystem.socialflylive.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Remove: const bodyParser = require("body-parser");
app.use(express.json({ limit: "10mb" })); // <-- replace bodyParser.json()
app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/api/admin", adminRoutes);
app.use("/api/user-data", userRoute);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/department", departmentRoutes);


app.get("/smtp-test", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
      connectionTimeout: 10000,
    });

    await transporter.verify();
    return res.status(200).json({ success: true, message: "SMTP connection successful ✅" });
  } catch (error) {
    console.error("❌ SMTP Connection Failed:", error);
    return res.status(500).json({ success: false, message: "SMTP connection failed", error });
  }
});

app.get("/", (req, res) => {
  res.send("Asset management API is running...");
});

// ✅ Create HTTP server & attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://assetsmanagementsystem.socialflylive.com",
    methods: ["GET", "POST"],
  },
});

// ✅ Handle socket connection
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`✅ User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Make io accessible in routes
app.set("io", io);

// ✅ Seed Super Admin
async function createSuperAdmin() {
  try {
    const existingSuperAdmin = await User.findOne({ role: "super-admin" });
    if (existingSuperAdmin) {
      console.log("✅ Super Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

    const superAdmin = new User({
      username: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: "super-admin",
    });

    await superAdmin.save();
    console.log("🚀 Super Admin created successfully");
  } catch (err) {
    console.error("❌ Error creating Super Admin:", err.message);
  }
}

// ✅ Run after DB connection
connectDB().then(() => createSuperAdmin());

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
