
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const products = [
  // ==================== FRUITS ====================
  {
    name: "Fresh Apples",
    category: "Fruits",
    price: 120,
    image: "/images/products/apple.png",
    stock: 20,
  },
  {
    name: "Fresh Bananas",
    category: "Fruits",
    price: 60,
    image: "/images/products/banana.png",
    stock: 25,
  },
  {
    name: "Fresh Oranges",
    category: "Fruits",
    price: 80,
    image: "/images/products/orange.png",
    stock: 20,
  },
  {
    name: "Fresh Grapes",
    category: "Fruits",
    price: 90,
    image: "/images/products/grapes.png",
    stock: 20,
  },
  {
    name: "Fresh Lemon",
    category: "Fruits",
    price: 40,
    image: "/images/products/lemon.png",
    stock: 25,
  },
  {
    name: "Fresh Strawberries",
    category: "Fruits",
    price: 150,
    image: "/images/products/strawberry.png",
    stock: 10,
  },
  {
    name: "Fresh Pears",
    category: "Fruits",
    price: 110,
    image: "/images/products/pear.png",
    stock: 15,
  },
  {
    name: "Fresh Avocado",
    category: "Fruits",
    price: 130,
    image: "/images/products/avocado.png",
    stock: 10,
  },

  // ==================== VEGETABLES ====================
  {
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price: 40,
    image: "/images/products/tomato.png",
    stock: 30,
  },
  {
    name: "Fresh Potatoes",
    category: "Vegetables",
    price: 35,
    image: "/images/products/potato.png",
    stock: 30,
  },
  {
    name: "Fresh Carrots",
    category: "Vegetables",
    price: 50,
    image: "/images/products/carrot.png",
    stock: 20,
  },
  {
    name: "Fresh Onions",
    category: "Vegetables",
    price: 45,
    image: "/images/products/onion.png",
    stock: 30,
  },
  {
    name: "Fresh Broccoli",
    category: "Vegetables",
    price: 80,
    image: "/images/products/broccoli.png",
    stock: 15,
  },
  {
    name: "Green Capsicum",
    category: "Vegetables",
    price: 40,
    image: "/images/products/capsicum.png",
    stock: 20,
  },
  {
    name: "Fresh Spinach",
    category: "Vegetables",
    price: 30,
    image: "/images/products/spinach.png",
    stock: 20,
  },
  {
    name: "Fresh Ginger",
    category: "Vegetables",
    price: 25,
    image: "/images/products/ginger.png",
    stock: 20,
  },
  {
    name: "Fresh Garlic",
    category: "Vegetables",
    price: 35,
    image: "/images/products/garlic.png",
    stock: 20,
  },
  {
    name: "Fresh Mushrooms",
    category: "Vegetables",
    price: 90,
    image: "/images/products/mushroom.png",
    stock: 15,
  },
  {
    name: "Fresh Green Peas",
    category: "Vegetables",
    price: 60,
    image: "/images/products/green-peas.png",
    stock: 20,
  },
  {
    name: "Fresh Sweet Corn",
    category: "Vegetables",
    price: 45,
    image: "/images/products/sweet-corn.png",
    stock: 20,
  },
  {
    name: "Fresh Zucchini",
    category: "Vegetables",
    price: 70,
    image: "/images/products/zucchini.png",
    stock: 15,
  },
  {
    name: "Fresh Eggplant",
    category: "Vegetables",
    price: 40,
    image: "/images/products/eggplant.png",
    stock: 20,
  },
  {
    name: "Fresh Lettuce",
    category: "Vegetables",
    price: 50,
    image: "/images/products/lettuce.png",
    stock: 15,
  },
  {
    name: "Fresh Red Cabbage",
    category: "Vegetables",
    price: 55,
    image: "/images/products/red-cabbage.png",
    stock: 15,
  },
  {
    name: "Fresh Radish",
    category: "Vegetables",
    price: 35,
    image: "/images/products/radish.png",
    stock: 20,
  },

  // ==================== DAIRY, BREAD & EGGS ====================
  {
    name: "Farm Fresh Eggs",
    category: "Dairy, Bread & Eggs",
    price: 70,
    image: "/images/products/eggs.png",
    stock: 25,
  },
  {
    name: "Fresh Milk",
    category: "Dairy, Bread & Eggs",
    price: 30,
    image: "/images/products/milk.png",
    stock: 25,
  },
  {
    name: "Butter",
    category: "Dairy, Bread & Eggs",
    price: 55,
    image: "/images/products/butter.png",
    stock: 20,
  },
  {
    name: "Cheese",
    category: "Dairy, Bread & Eggs",
    price: 30,
    image: "/images/products/cheese.png",
    stock: 20,
  },
  {
    name: "Natural Yogurt",
    category: "Dairy, Bread & Eggs",
    price: 45,
    image: "/images/products/yogurt.png",
    stock: 20,
  },
  {
    name: "Fresh Cream",
    category: "Dairy, Bread & Eggs",
    price: 65,
    image: "/images/products/cream.png",
    stock: 15,
  },

  // ==================== ATTA, RICE & DAL ====================
  {
    name: "Rice",
    category: "Atta, Rice & Dal",
    price: 65,
    image: "/images/products/rice.png",
    stock: 30,
  },
  {
    name: "Toor Dal",
    category: "Atta, Rice & Dal",
    price: 110,
    image: "/images/products/toor-dal.png",
    stock: 20,
  },
  {
    name: "Moong Dal",
    category: "Atta, Rice & Dal",
    price: 100,
    image: "/images/products/moong-dal.png",
    stock: 20,
  },
  {
    name: "Masoor Dal",
    category: "Atta, Rice & Dal",
    price: 90,
    image: "/images/products/masoor-dal.png",
    stock: 20,
  },
  {
    name: "Chickpeas",
    category: "Atta, Rice & Dal",
    price: 85,
    image: "/images/products/chickpeas.png",
    stock: 20,
  },
  {
    name: "Rajma",
    category: "Atta, Rice & Dal",
    price: 100,
    image: "/images/products/rajma.png",
    stock: 20,
  },
  {
    name: "Wheat Flour",
    category: "Atta, Rice & Dal",
    price: 55,
    image: "/images/products/wheat-flour.png",
    stock: 25,
  },
  {
    name: "Rolled Oats",
    category: "Atta, Rice & Dal",
    price: 100,
    image: "/images/products/oats.png",
    stock: 20,
  },
  {
    name: "Pasta",
    category: "Atta, Rice & Dal",
    price: 70,
    image: "/images/products/pasta.png",
    stock: 20,
  },

  // ==================== OIL & GHEE ====================
  {
    name: "Cooking Oil",
    category: "Oil & Ghee",
    price: 150,
    image: "/images/products/cooking-oil.png",
    stock: 20,
  },

  // ==================== SWEETENERS ====================
  {
    name: "Honey",
    category: "Sweeteners",
    price: 120,
    image: "/images/products/honey.png",
    stock: 15,
  },
  {
    name: "Sugar",
    category: "Sweeteners",
    price: 45,
    image: "/images/products/sugar.png",
    stock: 25,
  },
  {
    name: "Peanut Butter",
    category: "Sweeteners",
    price: 160,
    image: "/images/products/peanut-butter.png",
    stock: 15,
  },

  // ==================== TEA, COFFEE & DRINKS ====================
  {
    name: "Coffee",
    category: "Tea, Coffee & Drinks",
    price: 140,
    image: "/images/products/coffee.png",
    stock: 15,
  },
  {
    name: "Green Tea",
    category: "Tea, Coffee & Drinks",
    price: 100,
    image: "/images/products/green-tea.png",
    stock: 15,
  },
  {
    name: "Orange Juice",
    category: "Tea, Coffee & Drinks",
    price: 90,
    image: "/images/products/orange-juice.png",
    stock: 20,
  },

  // ==================== SNACK & MUNCHIES ====================
  {
    name: "Chocolate",
    category: "Snack & Munchies",
    price: 50,
    image: "/images/products/chocolate.png",
    stock: 20,
  },
  {
    name: "Popcorn",
    category: "Snack & Munchies",
    price: 35,
    image: "/images/products/popcorn.png",
    stock: 20,
  },

  // ==================== BAKERY & BISCUITS ====================
  {
    name: "Breakfast Cereal",
    category: "Bakery & Biscuits",
    price: 120,
    image: "/images/products/cereal.png",
    stock: 15,
  },

  // ==================== INSTANT FOOD ====================
  {
    name: "Tomato Ketchup",
    category: "Instant Food",
    price: 85,
    image: "/images/products/ketchup.png",
    stock: 15,
  },
  {
    name: "Mayonnaise",
    category: "Instant Food",
    price: 100,
    image: "/images/products/mayonnaise.png",
    stock: 15,
  },

  // ==================== CLEANING ESSENTIALS ====================
  {
    name: "Laundry Detergent",
    category: "Cleaning Essentials",
    price: 180,
    image: "/images/products/detergent.png",
    stock: 15,
  },
];

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing from the server .env file.");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let insertedCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    for (const productData of products) {
      const result = await Product.updateOne(
        { name: productData.name },
        {
          $set: {
            category: productData.category,
            image: productData.image,
          },
          $setOnInsert: {
            name: productData.name,
            price: productData.price,
            stock: productData.stock,
          },
        },
        {
          upsert: true,
          runValidators: true,
        }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else if (result.modifiedCount > 0) {
        updatedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log("\nFreshMart product seeding completed.");
    console.log(`Products processed: ${products.length}`);
    console.log(`New products inserted: ${insertedCount}`);
    console.log(`Existing products updated: ${updatedCount}`);
    console.log(`Existing products unchanged: ${unchangedCount}`);
  } catch (error) {
    console.error("Error adding products:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedProducts();
