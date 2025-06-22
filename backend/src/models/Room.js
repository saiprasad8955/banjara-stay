const mongoose = require("mongoose");

// Room Schema
const RoomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  number: { type: String, required: true },
  floor: { type: String, required: true },
  type: { type: String, required: true },
  rent: { type: Number, required: true },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance"],
    default: "available",
  },
  notes: { type: String },
  isDeleted: { type: Boolean, default: false },
});

// Exports
module.exports = mongoose.model("Room", RoomSchema);
