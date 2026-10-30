
const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Order = require("../models/Order");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/admin/customers
// Only administrators can view customer information.
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Fetch customer accounts without exposing password hashes.
    const customers = await User.find({ role: "user" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate order summaries for all customers in one aggregation.
    const customerIds = customers.map((customer) => customer._id);

    const orderSummaries = await Order.aggregate([
      {
        $match: {
          user: { $in: customerIds },
        },
      },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalOrderValue: { $sum: "$totalAmount" },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Match each customer's account with their order summary.
    const summaryByCustomer = new Map(
      orderSummaries.map((summary) => [
        summary._id.toString(),
        summary,
      ])
    );

    const result = customers.map((customer) => {
      const summary = summaryByCustomer.get(customer._id.toString());

      return {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        registeredAt: customer.createdAt,
        orderCount: summary?.orderCount || 0,
        totalOrderValue: summary?.totalOrderValue || 0,
        deliveredOrders: summary?.deliveredOrders || 0,
        cancelledOrders: summary?.cancelledOrders || 0,
      };
    });

    return res.status(200).json({
      totalCustomers: result.length,
      customers: result,
    });
  } catch (error) {
    console.error("Admin customers error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve customers.",
    });
  }
});

// GET /api/admin/customers/:id/orders
// View an individual customer's order history.
router.get("/:id/orders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid customer ID.",
      });
    }

    const customer = await User.findOne({
      _id: id,
      role: "user",
    })
      .select("name email createdAt")
      .lean();

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    const orders = await Order.find({ user: customer._id })
      .select(
        "items subtotal deliveryCharge tax totalAmount status paymentMethod createdAt deliveredAt cancelledAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        registeredAt: customer.createdAt,
      },
      orders,
    });
  } catch (error) {
    console.error("Customer order history error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve customer order history.",
    });
  }
});

module.exports = router;
