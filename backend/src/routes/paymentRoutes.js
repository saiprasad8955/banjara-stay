const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create payment
router.post("/payments", paymentController.createPayment);

// Get all payments
router.get("/payments", paymentController.getAllPayments);

// Get single payment
router.get("/payments/:id", paymentController.getPaymentById);

// Update payment
router.put("/payments/:id", paymentController.updatePayment);

// Soft delete
router.delete("/payments/:id", paymentController.deletePayment);

module.exports = router;
