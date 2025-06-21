const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// Routes
// app.use("/auth", authRoutes);

app.get("/me", (req, res) => {
  res.json({ user: "Its running" });
});

// app.use("/item", verifyToken, itemRoutes);
// app.use("/customer", verifyToken, customerRoutes);
// app.use("/invoice", verifyToken, invoiceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
