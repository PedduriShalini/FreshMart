
const express = require("express");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public: get categories for the storefront and product forms.
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      message: "Unable to load categories.",
    });
  }
});

// Admin: create a category.
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const image = String(req.body.image || "").trim();

    if (!name) {
      return res.status(400).json({
        message: "Category name is required.",
      });
    }

    if (name.length > 60 || description.length > 250) {
      return res.status(400).json({
        message: "Category name or description is too long.",
      });
    }

    const existing = await Category.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (existing) {
      return res.status(409).json({
        message: "A category with this name already exists.",
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
    });

    return res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A category with this name already exists.",
      });
    }

    return res.status(500).json({
      message: "Unable to create category.",
    });
  }
});

// Admin: update a category.
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const image = String(req.body.image || "").trim();

    if (!name) {
      return res.status(400).json({
        message: "Category name is required.",
      });
    }

    if (name.length > 60 || description.length > 250) {
      return res.status(400).json({
        message: "Category name or description is too long.",
      });
    }

    const duplicate = await Category.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another category already uses this name.",
      });
    }

    // Keep existing products linked by category name in sync.
    const oldName = category.name;

    await Product.updateMany(
      { category: oldName },
      { $set: { category: name } }
    );

    category.name = name;
    category.description = description;
    category.image = image;

    await category.save();

    return res.json({
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Another category already uses this name.",
      });
    }

    return res.status(500).json({
      message: "Unable to update category.",
    });
  }
});

// Admin: delete a category only when no products use it.
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const productsUsingCategory = await Product.countDocuments({
      category: {
        $regex: `^${category.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (productsUsingCategory > 0) {
      return res.status(409).json({
        message: `Cannot delete this category because ${productsUsingCategory} product(s) use it. Reassign those products first.`,
      });
    }

    await Category.findByIdAndDelete(id);

    return res.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      message: "Unable to delete category.",
    });
  }
});

module.exports = router;