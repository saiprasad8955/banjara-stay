// routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate all required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send({
        error: "firstName, lastName, email, and password are required.",
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ error: "User already exists." });
    }

    // Create new user (password will be hashed in the model)
    const user = new UserModel({ firstName, lastName, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).send({
      message: "User registered successfully",
      accessToken: token,
      user,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send({ error: "Server error during registration" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .send({ error: "email and password are required." });
    }

    // Find user
    const user = await UserModel.findOne({ email });
    console.log("🚀 ~ router.post ~ user:", user);
    if (!user) {
      return res.status(400).send({ error: "Invalid email or password." });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ error: "Invalid email or password." });
    }

    // Generate token
    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.send({ accessToken: token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send({ error: "Server error during login" });
  }
});

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
