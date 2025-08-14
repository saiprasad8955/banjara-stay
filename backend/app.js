const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const { verifyToken } = require("./src/middleware/auth");
const rTracer = require("cls-rtracer");

const authRoutes = require("./src/routes/authRoutes");
const roomRoutes = require("./src/routes/roomRoutes");
const residentFamilyRoutes = require("./src/routes/residentFamilyRoutes");
const rentPaymentRoutes = require("./src/routes/paymentRoutes");

dotenv.config();
const app = express();

// Enable CORS for all origins and include Authorization header
app.use(cors());

// Set the middleware for tracing requests and response
app.use(rTracer.expressMiddleware());

app.use((req, res, next) => {
  console.log(`${req.method}: ${req.originalUrl}`);
  next();
});

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: false, // Set to true only if you’re using cookies or auth headers
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", verifyToken, roomRoutes);
app.use("/api/v1/family", verifyToken, residentFamilyRoutes);
app.use("/api/v1/payment", verifyToken, rentPaymentRoutes);
app.use(
  "/api/v1/dashboard",
  verifyToken,
  require("./src/routes/dashboardRoutes")
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Banjara Stays API'S running on port ${PORT}`)
);
