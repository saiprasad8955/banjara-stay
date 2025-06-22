const ResidentPayment = require("../models/RentPayment");

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const {
      familyId,
      userId,
      roomId,
      month,
      rentAmount,
      lightBillAmount,
      paidAmount,
      paidOn,
      mode,
      isPaid,
      notes,
      lightReading,
    } = req.body;

    // Field validations
    if (
      !familyId ||
      !userId ||
      !roomId ||
      !month ||
      !rentAmount ||
      !lightBillAmount ||
      !paidAmount ||
      !paidOn ||
      !mode
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    // Calculate totalAmount
    const totalAmount = rentAmount + lightBillAmount;

    const payment = new ResidentPayment({
      familyId,
      userId,
      roomId,
      month,
      rentAmount,
      lightBillAmount,
      totalAmount,
      paidAmount,
      paidOn,
      mode,
      isPaid: isPaid || paidAmount >= totalAmount, // mark as paid if full amount paid
      notes,
      lightReading,
    });

    const saved = await payment.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating payment:", err);
    return res
      .status(500)
      .json({ error: "Server error while creating payment." });
  }
};

// Get all payments (not deleted)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await ResidentPayment.find({
      isDeleted: false,
      userId: req.user._id,
    });
    return res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching payments." });
  }
};

// Get single payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const payment = await ResidentPayment.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    return res.status(200).json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching payment." });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    // Recalculate total if amounts are changed
    if (
      updates.rentAmount !== undefined ||
      updates.lightBillAmount !== undefined
    ) {
      const rent = updates.rentAmount ?? 0;
      const light = updates.lightBillAmount ?? 0;
      updates.totalAmount = rent + light;
    }

    // Optional: recalculate isPaid
    if (updates.paidAmount !== undefined && updates.totalAmount !== undefined) {
      updates.isPaid = updates.paidAmount >= updates.totalAmount;
    }

    const updated = await ResidentPayment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Payment not found or deleted." });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating payment:", err);
    return res
      .status(500)
      .json({ error: "Server error while updating payment." });
  }
};

// Soft delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const deleted = await ResidentPayment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Payment not found or already deleted." });
    }

    return res.status(200).json({ message: "Payment deleted successfully." });
  } catch (err) {
    console.error("Error deleting payment:", err);
    return res
      .status(500)
      .json({ error: "Server error while deleting payment." });
  }
};
