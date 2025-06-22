const express = require("express");
const router = express.Router();
const familyController = require("../controllers/familyController");

// Create family
router.post("/families", familyController.createFamily);

// Get all families
router.get("/families", familyController.getAllFamilies);

// Get single family by ID
router.get("/families/:id", familyController.getFamilyById);

// Update family by ID
router.put("/families/:id", familyController.updateFamily);

// Delete family (soft delete)
router.delete("/families/:id", familyController.deleteFamily);

module.exports = router;
