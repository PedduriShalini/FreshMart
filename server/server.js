const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the frontend
app.use(cors());

// Allow Express to read JSON request data
app.use(express.json());

// Register API routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/reviews", reviewRoutes);


// Check whether the backend is working
app.get("/", (req, res) => {
  res.send("FreshMart backend is running!");
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    // Start the server after the database connects
    app.listen(PORT, () => {
      console.log(`FreshMart server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
