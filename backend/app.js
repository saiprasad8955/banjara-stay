// app.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const rTracer = require("cls-rtracer");
const { verifyToken } = require("./src/middleware/auth");

const authRoutes = require("./src/routes/authRoutes");
const roomRoutes = require("./src/routes/roomRoutes");
const residentFamilyRoutes = require("./src/routes/residentFamilyRoutes");
const rentPaymentRoutes = require("./src/routes/paymentRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(rTracer.expressMiddleware());
app.use(express.json());

// MongoDB connect
let isConnected;
async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
}
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", verifyToken, roomRoutes);
app.use("/api/v1/family", verifyToken, residentFamilyRoutes);
app.use("/api/v1/payment", verifyToken, rentPaymentRoutes);
app.use("/api/v1/dashboard", verifyToken, dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to BanjaraStay API" });
});

module.exports = app;
