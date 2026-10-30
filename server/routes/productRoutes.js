
const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Fetch all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Fetch products error:", error.message);
    res.status(500).json({ message: "Unable to fetch products." });
  }
});

// GET: Fetch one product (public)
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Fetch product error:", error.message);
    res.status(500).json({ message: "Unable to fetch product." });
  }
});

// POST: Create a product (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      image,
      description,
      stock,
      featured,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      typeof image !== "string" ||
      !image.trim()
    ) {
      return res.status(400).json({
        message: "Valid name, category, price, and image are required.",
      });
    }

    if (
      stock !== undefined &&
      (stock === "" ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0)
    ) {
      return res.status(400).json({
        message: "Stock must be a non-negative whole number.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      image: image.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      stock: stock === undefined ? 0 : Number(stock),
      featured: featured === true || featured === "true",
    });

    res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(500).json({ message: "Unable to create product." });
  }
});

// PUT: Update a product (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const allowedFields = [
      "name",
      "category",
      "price",
      "image",
      "description",
      "stock",
      "featured",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update.",
      });
    }

    if ("name" in updates) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return res.status(400).json({ message: "Product name is required." });
      }
      updates.name = updates.name.trim();
    }

    if ("category" in updates) {
      if (
        typeof updates.category !== "string" ||
        !updates.category.trim()
      ) {
        return res.status(400).json({ message: "Category is required." });
      }
      updates.category = updates.category.trim();
    }

    if ("image" in updates) {
      if (typeof updates.image !== "string" || !updates.image.trim()) {
        return res.status(400).json({ message: "Product image is required." });
      }
      updates.image = updates.image.trim();
    }

    if ("description" in updates && typeof updates.description !== "string") {
      return res.status(400).json({
        message: "Description must be text.",
      });
    }

    if ("price" in updates) {
      if (
        updates.price === "" ||
        !Number.isFinite(Number(updates.price)) ||
        Number(updates.price) < 0
      ) {
        return res.status(400).json({
          message: "Price must be a non-negative number.",
        });
      }
      updates.price = Number(updates.price);
    }

    if ("stock" in updates) {
      if (
        updates.stock === "" ||
        !Number.isInteger(Number(updates.stock)) ||
        Number(updates.stock) < 0
      ) {
        return res.status(400).json({
          message: "Stock must be a non-negative whole number.",
        });
      }
      updates.stock = Number(updates.stock);
    }

    if ("featured" in updates) {
      if (
        updates.featured !== true &&
        updates.featured !== false &&
        updates.featured !== "true" &&
        updates.featured !== "false"
      ) {
        return res.status(400).json({
          message: "Featured must be true or false.",
        });
      }
      updates.featured = updates.featured === true || updates.featured === "true";
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({ message: "Unable to update product." });
  }
});

// DELETE: Remove a product (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ message: "Unable to delete product." });
  }
});

module.exports = router;
