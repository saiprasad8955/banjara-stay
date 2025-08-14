const express = require("express");
const serverless = require("serverless-http");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const rTracer = require("cls-rtracer");
const { verifyToken } = require("../src/middleware/auth");

const authRoutes = require("../src/routes/authRoutes");
const roomRoutes = require("../src/routes/roomRoutes");
const residentFamilyRoutes = require("../src/routes/residentFamilyRoutes");
const rentPaymentRoutes = require("../src/routes/paymentRoutes");
const dashboardRoutes = require("../src/routes/dashboardRoutes");

dotenv.config();
const app = express();

// CORS
app.use(
  cors({
    origin: ["http://localhost:3033", "https://banjara-stay-w88q.vercel.app"],
    credentials: true,
  })
);

// Request tracing
app.use(rTracer.expressMiddleware());

// Logging requests
app.use((req, res, next) => {
  console.log(`${req.method}: ${req.originalUrl}`);
  next();
});

app.use(express.json());

// Connect to MongoDB (only once per instance)
let isConnected;
async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", verifyToken, roomRoutes);
app.use("/api/v1/family", verifyToken, residentFamilyRoutes);
app.use("/api/v1/payment", verifyToken, rentPaymentRoutes);
app.use("/api/v1/dashboard", verifyToken, dashboardRoutes);

const PORT = process.env.PORT || 5000;

// If app is a serverless export, unwrap it
if (typeof app === "function") {
  const normalApp = express();
  normalApp.use(app);
  normalApp.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export handler for Vercel
module.exports = serverless(app);
