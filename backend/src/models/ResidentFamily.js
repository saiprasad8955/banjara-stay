// rentalModels.js

const mongoose = require("mongoose");

// FamilyMember Schema
const FamilyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    aadhar: { type: String, required: true },
    mobile: { type: String },
  },
  { _id: false }
);

// Family Schema
const FamilySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  head: { type: FamilyMemberSchema, required: true },
  members: { type: [FamilyMemberSchema], default: [] },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String },
  isActive: { type: Boolean, default: true },
  advancePaid: { type: Number, default: 0 },
  notes: { type: String },
  isDeleted: { type: Boolean, default: false },
});

// Exports
module.exports = mongoose.model("ResidentFamily", FamilySchema);
