
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Verify a normal customer using the existing customer JWT.
function verifyCustomer(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "A customer account is required.",
      });
    }

    next();
  });
}

// GET /api/reviews/product/:productId
// Public: only approved reviews are visible.
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const reviews = await Review.find({
      product: productId,
      status: "Approved",
    })
      .populate("user", "name")
      .select("user rating comment createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const averageRating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length;

    return res.status(200).json({
      reviews: reviews.map((review) => ({
        id: review._id,
        customerName: review.user?.name || "Customer",
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      totalReviews: reviews.length,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve reviews.",
    });
  }
});

// POST /api/reviews
// Customers can review products they have purchased.
router.post("/", verifyCustomer, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (
      !mongoose.isValidObjectId(productId) ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message:
          "Provide a valid product, a rating from 1 to 5, and a comment between 3 and 1000 characters.",
      });
    }

    const product = await Product.findById(productId).select("_id");

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    // Require a completed purchase: a delivered order containing this product.
    const hasPurchased = await Order.exists({
      user: req.user.id,
      status: "Delivered",
      "items.product": productId,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "You can review this product after it has been delivered.",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment: comment.trim(),
      status: "Pending",
    });

    return res.status(201).json({
      message: "Review submitted and awaiting admin approval.",
      review: {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this product.",
      });
    }

    console.error("Submit review error:", error.message);

    return res.status(500).json({
      message: "Unable to submit your review.",
    });
  }
});

// GET /api/reviews/admin/all
// Admin: view reviews awaiting moderation and previously moderated reviews.
router.get("/admin/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const filter = {};

    if (["Pending", "Approved", "Rejected"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Admin reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve reviews.",
    });
  }
});

// PATCH /api/reviews/admin/:id
// Admin: approve or reject a review.
router.patch(
  "/admin/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid review ID.",
        });
      }

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          message: "Status must be Approved or Rejected.",
        });
      }

      const review = await Review.findByIdAndUpdate(
        id,
        {
          $set: {
            status,
            moderatedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!review) {
        return res.status(404).json({
          message: "Review not found.",
        });
      }

      return res.status(200).json({
        message: `Review ${status.toLowerCase()} successfully.`,
        review,
      });
    } catch (error) {
      console.error("Moderate review error:", error.message);

      return res.status(500).json({
        message: "Unable to update review status.",
      });
    }
  }
);

module.exports = router;
