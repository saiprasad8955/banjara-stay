const Room = require("../models/Room");
const ResidentFamily = require("../models/ResidentFamily");

// CREATE Room
exports.createRoom = async (req, res) => {
  try {
    const { number, floor, type, rent, status, notes } = req.body;
    console.log("🚀 ~ req.body:", req.body);

    // Basic validation
    if (!number || !floor || !type || !rent) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    // Create and save room
    const newRoom = new Room({
      userId: req.user._id,
      number,
      floor,
      type,
      rent,
      status,
      notes,
    });
    const savedRoom = await newRoom.save();

    return res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ error: "Server error while creating room." });
  }
};

// READ all rooms (excluding soft deleted)
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isDeleted: false, userId: req.user._id });

    return res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching rooms." });
  }
};

// READ single room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const families = await ResidentFamily.find({
      roomId: req.params.id,
      isDeleted: false,
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: { room, families } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// UPDATE room by ID
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid room ID format." });
    }

    const room = await Room.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!room) {
      return res
        .status(404)
        .json({ error: "Room not found or already deleted." });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    return res.status(500).json({ error: "Server error while updating room." });
  }
};

// DELETE (soft delete) room
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid room ID format." });
    }

    const room = await Room.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!room) {
      return res
        .status(404)
        .json({ error: "Room not found or already deleted." });
    }

    return res.status(200).json({ message: "Room soft-deleted successfully." });
  } catch (error) {
    console.error("Error deleting room:", error);
    return res.status(500).json({ error: "Server error while deleting room." });
  }
};
