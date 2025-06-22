const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const { verifyToken } = require("./src/middleware/auth");

const authRoutes = require("./src/routes/authRoutes");
const roomRoutes = require("./src/routes/roomRoutes");
const residentFamilyRoutes = require("./src/routes/residentFamilyRoutes");
const rentPaymentRoutes = require("./src/routes/paymentRoutes");

dotenv.config();
const app = express();

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

app.use("/user/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

app.use("/api/v1/room", verifyToken, roomRoutes);
app.use("/api/v1/resident", verifyToken, residentFamilyRoutes);
app.use("/api/v1/payment", verifyToken, rentPaymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Banjara Stays API'S running on port ${PORT}`)
);
