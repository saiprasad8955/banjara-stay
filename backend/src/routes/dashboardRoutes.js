const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Room = require("../models/Room");
const ResidentFamily = require("../models/ResidentFamily");
// CORRECTED: Model name should match the schema export
const ResidentPayment = require("../models/RentPayment");

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get key statistics for the main dashboard cards.
 */
router.get("/stats", async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments({ isDeleted: false });
    const occupiedRooms = await Room.countDocuments({
      isDeleted: false,
      status: "Occupied",
    });
    const totalFamilies = await ResidentFamily.countDocuments({
      isDeleted: false,
      isActive: true,
    });

    const now = new Date();
    // CORRECTED: Using proper Date objects for querying
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    ); // End of the last day of the month

    const monthlyRevenueResult = await ResidentPayment.aggregate([
      {
        $match: {
          // Assuming 'paidOn' is a Date type or a 'YYYY-MM-DD' string that can be cast
          paidOn: {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paidAmount" },
        },
      },
    ]);

    const monthlyRevenue =
      monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;
    const occupancyRate =
      totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        totalFamilies,
        monthlyRevenue,
        occupancyRate,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * @route   GET /api/v1/dashboard/revenue-chart
 * @desc    Get revenue data for the last 6 months for the bar chart.
 */
router.get("/revenue-chart", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueData = await ResidentPayment.aggregate([
      {
        $match: {
          // CORRECTED: Using a proper Date object for the query range
          paidOn: { $gte: sixMonthsAgo.toISOString().split("T")[0] },
        },
      },
      {
        $group: {
          _id: "$month", // Group by the "YYYY-MM" string field
          totalRevenue: { $sum: "$paidAmount" },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartData = revenueData.map((item) => {
      const [year, month] = item._id.split("-");
      return {
        month: monthNames[parseInt(month) - 1],
        revenue: item.totalRevenue,
      };
    });

    res.json({ success: true, data: chartData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * @route   GET /api/v1/dashboard/recent-activity
 * @desc    Get a list of the most recent check-ins and payments.
 */
router.get("/recent-activity", async (req, res) => {
  try {
    const recentCheckIns = await ResidentFamily.find({ isDeleted: false })
      .sort({ checkInDate: -1 })
      .limit(3)
      .select("head.name checkInDate");

    const recentPayments = await ResidentPayment.find()
      .sort({ paidOn: -1 })
      .limit(3)
      .populate("familyId", "head.name");

    const activityFeed = [
      ...recentCheckIns.map((f) => ({
        id: f._id,
        name: f.head.name,
        action: `Checked in`,
        time: new Date(f.checkInDate), // Cast to Date for accurate sorting
        type: "check-in",
      })),
      ...recentPayments.map((p) => ({
        id: p._id,
        name: p.familyId ? p.familyId.head.name : "Unknown Family",
        action: `Payment of ₹${p.paidAmount.toLocaleString()} received`,
        time: new Date(p.paidOn), // Cast to Date for accurate sorting
        type: "payment",
      })),
    ];
    // CORRECTED: Sort combined feed by Date objects
    const sortedFeed = activityFeed.sort((a, b) => b.time - a.time).slice(0, 5);

    res.json({ success: true, data: sortedFeed });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * @route   GET /api/v1/dashboard/top-rooms
 * @desc    Get the top-performing rooms by total revenue.
 */
router.get("/top-rooms", async (req, res) => {
  try {
    const topRooms = await ResidentPayment.aggregate([
      {
        $group: {
          _id: "$roomId",
          totalRevenue: { $sum: "$paidAmount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
      { $unwind: "$roomDetails" },
    ]);

    const formattedData = topRooms.map((room) => ({
      id: room._id,
      number: room.roomDetails.number,
      type: room.roomDetails.type,
      revenue: room.totalRevenue,
    }));

    res.json({ success: true, data: formattedData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
