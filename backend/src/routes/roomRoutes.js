const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Create Room
router.post("/rooms", roomController.createRoom);

// Get all rooms
router.get("/rooms", roomController.getAllRooms);

// Get single room
router.get("/rooms/:id", roomController.getRoomById);

// Update room
router.put("/rooms/:id", roomController.updateRoom);

// Delete (soft delete) room
router.delete("/rooms/:id", roomController.deleteRoom);

module.exports = router;
