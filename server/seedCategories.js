
const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");

const categories = [
  {
    name: "Fruits",
    image: "/images/products/banana.png",
  },
  {
    name: "Vegetables",
    image: "/images/products/carrot.png",
  },
  {
    name: "Dairy, Bread & Eggs",
    image: "/images/category/category-1.jpg",
  },
  {
    name: "Snack & Munchies",
    image: "/images/category/category-2.jpg",
  },
  {
    name: "Bakery & Biscuits",
    image: "/images/category/category-3.jpg",
  },
  {
    name: "Instant Food",
    image: "/images/category/category-4.jpg",
  },
  {
    name: "Tea, Coffee & Drinks",
    image: "/images/category/category-5.jpg",
  },
  {
    name: "Atta, Rice & Dal",
    image: "/images/category/category-atta-rice-dal.jpg",
  },
  {
    name: "Baby Care",
    image: "/images/category/category-baby-care.jpg",
  },
  {
    name: "Chicken, Meat & Fish",
    image: "/images/category/category-chicken-meat-fish.jpg",
  },
  {
    name: "Cleaning Essentials",
    image: "/images/category/category-cleaning-essentials.jpg",
  },
  {
    name: "Pet Care",
    image: "/images/category/category-pet-care.jpg",
  },
];

async function seedCategories() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the server .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const categoryData of categories) {
      await Category.findOneAndUpdate(
        { name: categoryData.name },
        {
          $set: {
            image: categoryData.image,
          },
          $setOnInsert: {
            name: categoryData.name,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    console.log("FreshMart categories seeded successfully.");
    console.log(`Categories processed: ${categories.length}`);
  } catch (error) {
    console.error("Error seeding categories:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedCategories();
