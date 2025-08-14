const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Create Room
router.post("/create", roomController.createRoom);

// Get all rooms
router.get("/list", roomController.getAllRooms);

// Get single room
router.get("/:id", roomController.getRoomById);

// Update room
router.put("/update/:id", roomController.updateRoom);

// Delete (soft delete) room
router.delete("/delete/:id", roomController.deleteRoom);

module.exports = router;
