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

// CORS config
app.use(
  cors({
    origin: ["http://localhost:3033", "https://banjara-stay-w88q.vercel.app"],
    credentials: true, // set to false if no cookies/auth headers are sent
  })
);

// Request tracing
app.use(rTracer.expressMiddleware());

// Logging requests
app.use((req, res, next) => {
  console.log(`[${rTracer.id()}] ${req.method}: ${req.originalUrl}`);
  next();
});

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", verifyToken, roomRoutes);
app.use("/api/v1/family", verifyToken, residentFamilyRoutes);
app.use("/api/v1/payment", verifyToken, rentPaymentRoutes);
app.use("/api/v1/dashboard", verifyToken, dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Banjara Stays API running on port ${PORT}`);
});
