
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// 1. CUSTOMER: CREATE A NEW ORDER
// POST /api/orders
// =====================================================
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      paymentMethod = "COD",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.name ||
      !deliveryAddress.phone ||
      !deliveryAddress.address ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.pincode
    ) {
      return res.status(400).json({
        message: "Please provide a complete delivery address.",
      });
    }

    if (!/^[6-9]\d{9}$/.test(String(deliveryAddress.phone))) {
      return res.status(400).json({
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    if (!/^\d{6}$/.test(String(deliveryAddress.pincode))) {
      return res.status(400).json({
        message: "Enter a valid 6-digit PIN code.",
      });
    }

    if (paymentMethod !== "COD") {
      return res.status(400).json({
        message: "Only Cash on Delivery is currently supported.",
      });
    }

    // Validate product IDs and quantities.
    const quantities = new Map();

    for (const item of items) {
      const productId = item.product || item.productId;
      const quantity = Number(item.quantity);

      if (
        !productId ||
        !mongoose.isValidObjectId(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity in your cart.",
        });
      }

      // Combine duplicate product entries.
      const key = String(productId);
      quantities.set(key, (quantities.get(key) || 0) + quantity);
    }

    const orderItems = [];
    let subtotal = 0;

    for (const [productId, quantity] of quantities) {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "A product in your cart could not be found.",
        });
      }

      if (
        product.stock !== undefined &&
        product.stock !== null &&
        Number(product.stock) < quantity
      ) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: `Invalid price for ${product.name}.`,
        });
      }

      subtotal += price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
      });
    }

    // Delivery is free for orders of ₹500 or more.
    const deliveryCharge = subtotal >= 500 ? 0 : 40;

    // 5% tax calculation.
    const tax = Number((subtotal * 0.05).toFixed(2));

    const totalAmount = Number(
      (subtotal + deliveryCharge + tax).toFixed(2)
    );

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      deliveryAddress: {
        name: String(deliveryAddress.name).trim(),
        phone: String(deliveryAddress.phone).trim(),
        address: String(deliveryAddress.address).trim(),
        city: String(deliveryAddress.city).trim(),
        state: String(deliveryAddress.state).trim(),
        pincode: String(deliveryAddress.pincode).trim(),
      },
      paymentMethod: "COD",
      subtotal: Number(subtotal.toFixed(2)),
      deliveryCharge,
      tax,
      totalAmount,
      status: "Placed",
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Unable to place your order.",
    });
  }
});

// =====================================================
// 2. CUSTOMER: GET MY ORDERS
// GET /api/orders/my-orders
// =====================================================
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    return res.status(500).json({
      message: "Unable to fetch your orders.",
    });
  }
});

// =====================================================
// 3. CUSTOMER: CANCEL AN ORDER
// PATCH /api/orders/:id/cancel
// =====================================================
router.patch("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Administrators cannot use customer cancellation.",
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
        status: { $in: ["Placed", "Processing"] },
      },
      {
        $set: {
          status: "Cancelled",
          cancelledAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      const existingOrder = await Order.findOne({
        _id: id,
        user: req.user.id,
      });

      if (!existingOrder) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      return res.status(400).json({
        message: "This order can no longer be cancelled.",
      });
    }

    return res.json({
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      message: "Unable to cancel the order.",
    });
  }
});

// =====================================================
// 4. ADMIN: GET ALL ORDERS
// GET /api/orders
// =====================================================
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);

    return res.status(500).json({
      message: "Unable to fetch orders.",
    });
  }
});

// =====================================================
// 5. ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// =====================================================
router.patch(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      if (order.status === "Cancelled" && status !== "Cancelled") {
        return res.status(400).json({
          message: "A cancelled order cannot be reopened.",
        });
      }

      if (order.status === "Delivered" && status !== "Delivered") {
        return res.status(400).json({
          message: "A delivered order cannot be changed.",
        });
      }

      const update = { status };

      if (status === "Shipped" && !order.shippedAt) {
        update.shippedAt = new Date();
      }

      if (status === "Delivered" && !order.deliveredAt) {
        update.deliveredAt = new Date();
      }

      if (status === "Cancelled" && !order.cancelledAt) {
        update.cancelledAt = new Date();
      }

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: id,
          status: order.status,
        },
        { $set: update },
        {
          new: true,
          runValidators: true,
        }
      ).populate("user", "name email");

      if (!updatedOrder) {
        return res.status(409).json({
          message: "The order changed. Refresh and try again.",
        });
      }

      return res.json({
        message: "Order status updated successfully.",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);

      return res.status(500).json({
        message: "Unable to update order status.",
      });
    }
  }
);

// =====================================================
// 6. ADMIN: ASSIGN RIDER AND DELIVERY ESTIMATE
// PATCH /api/orders/:id/delivery
// =====================================================
router.patch(
  "/:id/delivery",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { estimatedDeliveryAt, rider } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      if (["Cancelled", "Delivered"].includes(order.status)) {
        return res.status(400).json({
          message: "Delivery details cannot be changed for this order.",
        });
      }

      const update = {};

      if (estimatedDeliveryAt !== undefined) {
        if (estimatedDeliveryAt === "") {
          update.estimatedDeliveryAt = null;
        } else {
          const date = new Date(estimatedDeliveryAt);

          if (
            Number.isNaN(date.getTime()) ||
            date.getTime() <= Date.now()
          ) {
            return res.status(400).json({
              message: "Enter a valid future delivery date and time.",
            });
          }

          update.estimatedDeliveryAt = date;
        }
      }

      if (rider !== undefined) {
        if (
          !rider ||
          typeof rider !== "object" ||
          Array.isArray(rider)
        ) {
          return res.status(400).json({
            message: "Invalid rider details.",
          });
        }

        const name = String(rider.name || "").trim();
        const phone = String(rider.phone || "").trim();
        const vehicleNumber = String(
          rider.vehicleNumber || ""
        ).trim();

        // Allow clearing the rider assignment.
        if (!name && !phone && !vehicleNumber) {
          update.rider = {
            name: "",
            phone: "",
            vehicleNumber: "",
            assignedAt: null,
          };
        } else {
          if (!name || !/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
              message: "Enter a rider name and valid mobile number.",
            });
          }

          update.rider = {
            name,
            phone,
            vehicleNumber,
            assignedAt: new Date(),
          };
        }
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          message: "No delivery changes provided.",
        });
      }

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: id,
          status: { $nin: ["Cancelled", "Delivered"] },
        },
        { $set: update },
        {
          new: true,
          runValidators: true,
        }
      ).populate("user", "name email");

      if (!updatedOrder) {
        return res.status(409).json({
          message: "Order status changed. Refresh and try again.",
        });
      }

      return res.json({
        message: "Delivery details updated successfully.",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Update delivery error:", error);

      return res.status(500).json({
        message: "Unable to update delivery details.",
      });
    }
  }
);

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;
