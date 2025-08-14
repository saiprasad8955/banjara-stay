const mongoose = require("mongoose");

// Room Schema
const RoomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    number: { type: String, required: true },
    floor: { type: String, required: true },
    type: { type: String, required: true },
    rent: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "available",
    },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Exports
module.exports = mongoose.model("Room", RoomSchema);
