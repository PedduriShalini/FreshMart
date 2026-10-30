
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5.",
      },
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One review per customer per product.
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Helps retrieve approved reviews for a product.
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
