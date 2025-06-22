const ResidentFamily = require("../models/ResidentFamily");

// CREATE Family
exports.createFamily = async (req, res) => {
  try {
    const {
      userId,
      roomId,
      head,
      members = [],
      checkInDate,
      checkOutDate,
      advancePaid = 0,
      notes,
    } = req.body;

    // Basic field validation
    if (!userId || !roomId || !head || !checkInDate) {
      return res
        .status(400)
        .json({ error: "userId, roomId, head, and checkInDate are required." });
    }

    if (!head.name || !head.aadhar) {
      return res
        .status(400)
        .json({ error: "Head's name and aadhar are required." });
    }

    // Optional: Validate Aadhar length/format, or mobile format

    const newFamily = new ResidentFamily({
      userId,
      roomId,
      head,
      members,
      checkInDate,
      checkOutDate,
      advancePaid,
      notes,
    });

    const savedFamily = await newFamily.save();
    return res.status(201).json(savedFamily);
  } catch (err) {
    console.error("Error creating family:", err);
    return res
      .status(500)
      .json({ error: "Server error while creating family." });
  }
};

// GET all families (excluding soft deleted)
exports.getAllFamilies = async (req, res) => {
  try {
    const families = await ResidentFamily.find({
      isDeleted: false,
      userId: req.user._id,
    });
    return res.status(200).json(families);
  } catch (err) {
    console.error("Error fetching families:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching families." });
  }
};

// GET single family by ID
exports.getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const family = await ResidentFamily.findOne({ _id: id, isDeleted: false });

    if (!family) {
      return res.status(404).json({ error: "Family not found." });
    }

    return res.status(200).json(family);
  } catch (err) {
    console.error("Error fetching family:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching family." });
  }
};

// UPDATE family by ID
exports.updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const updated = await ResidentFamily.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Family not found or already deleted." });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating family:", err);
    return res
      .status(500)
      .json({ error: "Server error while updating family." });
  }
};

// DELETE (soft delete) family
exports.deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const deleted = await ResidentFamily.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Family not found or already deleted." });
    }

    return res
      .status(200)
      .json({ message: "Family soft-deleted successfully." });
  } catch (err) {
    console.error("Error deleting family:", err);
    return res
      .status(500)
      .json({ error: "Server error while deleting family." });
  }
};
