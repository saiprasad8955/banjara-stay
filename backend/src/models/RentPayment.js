const mongoose = require("mongoose");

// Resident Payment Schema (merged Rent + Light Bill)
const ResidentPaymentSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  month: { type: String, required: true }, // e.g., "2025-06"

  rentAmount: { type: Number, required: true },
  lightBillAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  paidAmount: { type: Number, required: true },
  paidOn: { type: String, required: true },
  mode: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
  notes: { type: String },

  lightReading: {
    previous: { type: Number },
    current: { type: Number },
    ratePerUnit: { type: Number },
  },
  isDeleted: { type: Boolean, default: false },
});

// Exports
module.exports = mongoose.model("ResidentPayment", ResidentPaymentSchema);
