const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Room = require("../models/Room");
const ResidentFamily = require("../models/ResidentFamily");
const ResidentPayment = require("../models/RentPayment");

// @route   POST /api/v1/family/check-in
// @desc    Check in a new family to a room
router.post("/check-in", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { roomId, head, members, checkInDate, advancePaid, notes } = req.body;

    // 1. Create the new family record
    const newFamily = new ResidentFamily({
      roomId,
      head,
      members,
      checkInDate,
      advancePaid,
      notes,
      isActive: true,
      checkOutDate: null,
      isDeleted: false,
      userId: req.user._id, // Assuming user ID is available in req.user
    });
    await newFamily.save({ session });

    // 2. Update the room status to 'Occupied'
    await Room.findByIdAndUpdate(roomId, { status: "Occupied" }, { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, data: newFamily });
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    session.endSession();
  }
});

// @route   PUT /api/v1/family/check-out/:familyId
// @desc    Check out a family and make the room available
router.put("/check-out/:familyId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const family = await ResidentFamily.findById(req.params.familyId).session(
      session
    );
    if (!family) {
      return res
        .status(404)
        .json({ success: false, message: "Family not found" });
    }

    // 1. Update family record to inactive and set check-out date
    family.isActive = false;
    family.checkOutDate = new Date();
    await family.save({ session });

    // 2. Update the room status back to 'Available'
    await Room.findByIdAndUpdate(
      family.roomId,
      { status: "Available" },
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, data: family });
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    session.endSession();
  }
});

// @route   POST /api/v1/family/:familyId/members
// @desc    Add a member to an existing family
router.post("/:familyId/members", async (req, res) => {
  try {
    const family = await ResidentFamily.findByIdAndUpdate(
      req.params.familyId,
      { $push: { members: req.body } },
      { new: true }
    );
    if (!family) {
      return res
        .status(404)
        .json({ success: false, message: "Family not found" });
    }
    res.status(201).json({ success: true, data: family });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   PUT /api/v1/family/:familyId/members/:memberId
// @desc    Update a specific family member's details
router.put("/:familyId/members/:memberId", async (req, res) => {
  try {
    const { name, aadhar, mobile } = req.body;
    const family = await ResidentFamily.findOneAndUpdate(
      { _id: req.params.familyId, "members._id": req.params.memberId },
      {
        $set: {
          "members.$.name": name,
          "members.$.aadhar": aadhar,
          "members.$.mobile": mobile,
        },
      },
      { new: true }
    );

    if (!family) {
      return res
        .status(404)
        .json({ success: false, message: "Family or member not found" });
    }
    res.json({ success: true, data: family });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   DELETE /api/v1/family/:familyId/members/:memberId
// @desc    Delete a member from a family
router.delete("/:familyId/members/:memberId", async (req, res) => {
  try {
    const family = await ResidentFamily.findByIdAndUpdate(
      req.params.familyId,
      { $pull: { members: { _id: req.params.memberId } } },
      { new: true }
    );
    if (!family) {
      return res
        .status(404)
        .json({ success: false, message: "Family not found" });
    }
    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   GET /api/v1/family/:familyId/payments
// @desc    Get a summarized rent & electricity bill history for a family
router.get("/:familyId/payments", async (req, res) => {
  try {
    const family = await ResidentFamily.findById(req.params.familyId).populate(
      "roomId"
    );
    if (!family) {
      return res
        .status(404)
        .json({ success: false, message: "Family not found" });
    }

    // Fetch all individual payment records for this family
    const allPayments = await ResidentPayment.find({
      familyId: req.params.familyId,
    }).sort({ paidOn: -1 });

    const monthlySummary = {};
    const startDate = new Date(family.checkInDate);
    const endDate = family.isActive
      ? new Date()
      : new Date(family.checkOutDate);
    let currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

    // Generate all months the resident has been active
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const monthKey = `${year}-${month}`;

      monthlySummary[monthKey] = {
        month: monthKey,
        rentAmount: family.roomId.rent,
        lightBillAmount: 0,
        totalDue: family.roomId.rent,
        totalPaid: 0,
        balance: -family.roomId.rent,
        status: "Pending",
        transactions: [],
      };
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Populate the monthly summary with actual payment data
    allPayments.forEach((p) => {
      if (monthlySummary[p.month]) {
        const summary = monthlySummary[p.month];
        summary.transactions.push(p);
        summary.totalPaid += p.paidAmount;
        summary.lightBillAmount = p.lightBillAmount; // Assume last entry for the month has the correct bill
        summary.totalDue = p.rentAmount + p.lightBillAmount;
        summary.balance = summary.totalPaid - summary.totalDue;
        summary.status = summary.balance >= 0 ? "Paid" : "Partially Paid";
      }
    });

    // Convert map to array and set Overdue status for past unpaid months
    const finalHistory = Object.values(monthlySummary).map((summary) => {
      const [year, month] = summary.month.split("-").map(Number);
      const today = new Date();
      const monthEnd = new Date(year, month, 0);

      if (summary.status === "Pending" && today > monthEnd) {
        summary.status = "Overdue";
      }
      return summary;
    });

    res.json({ success: true, data: finalHistory.reverse() }); // Show most recent first
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   POST /api/v1/payments
// @desc    Record a new payment transaction (rent, electricity, or both)
router.post("/payment/create", async (req, res) => {
  try {
    const newBody = req.body;
    newBody.userId = req.user._id;
    const newPayment = new ResidentPayment(req.body);
    await newPayment.save();
    res.status(201).json({ success: true, data: newPayment });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   GET /api/v1/families
// @desc    Get all families with pagination
router.get("/list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const families = await ResidentFamily.find({ isDeleted: false })
      .populate("roomId", "number type rent") // Get the room number
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ResidentFamily.countDocuments({ isDeleted: false });

    res.json({
      success: true,
      data: families,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   POST /api/v1/families
// @desc    Add a new family (Simplified version, assumes check-in elsewhere)
router.post("/create", async (req, res) => {
  try {
    const newFamily = new ResidentFamily(req.body);
    await newFamily.save();
    res.status(201).json({ success: true, data: newFamily });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   PUT /api/v1/families/:id
// @desc    Update a family
router.put("/update/:id", async (req, res) => {
  try {
    const family = await ResidentFamily.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!family) {
      return res
        .status(404)
        .json({ success: false, message: "Family not found" });
    }
    res.json({ success: true, data: family });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   DELETE /api/v1/families/:id
// @desc    Delete a family (soft delete)
router.delete("/delete/:id", async (req, res) => {
  try {
    const family = await ResidentFamily.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!family) {
      return res
        .status(404)
        .json({ success: false, message: "Family not found" });
    }
    res.json({ success: true, message: "Family deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
