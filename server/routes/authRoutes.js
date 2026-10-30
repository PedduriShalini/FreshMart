
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Verify JWT and require a normal customer account.
async function verifyCustomer(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Please log in to access your delivery address.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication is not configured.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "user" || !decoded.userId) {
      return res.status(403).json({
        message: "Customer account access is required.",
      });
    }

    req.customerId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session has expired. Please log in again.",
    });
  }
}

// Register a normal customer account.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Name, valid email, and a password of at least 8 characters are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Unable to register right now.",
    });
  }
});

// Log in an existing customer or administrator.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message: "Authentication is not configured.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in right now.",
    });
  }
});

// Get the logged-in customer's saved delivery address.
router.get("/address", verifyCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.customerId).select(
      "name deliveryAddress"
    );

    if (!user) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    const savedAddress = user.deliveryAddress?.toObject
      ? user.deliveryAddress.toObject()
      : user.deliveryAddress || {};

    return res.status(200).json({
      address: {
        name: savedAddress.name || user.name || "",
        phone: savedAddress.phone || "",
        address: savedAddress.address || "",
        city: savedAddress.city || "",
        state: savedAddress.state || "",
        pincode: savedAddress.pincode || "",
      },
    });
  } catch (error) {
    console.error("Get address error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve your delivery address.",
    });
  }
});

// Save or update the logged-in customer's delivery address.
router.patch("/address", verifyCustomer, async (req, res) => {
  try {
    const fields = [
      "name",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    const deliveryAddress = {};

    for (const field of fields) {
      const value = req.body[field];

      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({
          message: `Please provide a valid ${field}.`,
        });
      }

      deliveryAddress[field] = value.trim();
    }

    if (!/^[6-9]\d{9}$/.test(deliveryAddress.phone)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Indian mobile number.",
      });
    }

    if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      return res.status(400).json({
        message: "Enter a valid 6-digit PIN code.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.customerId,
      {
        $set: {
          deliveryAddress,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("name deliveryAddress");

    if (!user) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    return res.status(200).json({
      message: "Delivery address saved successfully.",
      address: user.deliveryAddress,
    });
  } catch (error) {
    console.error("Save address error:", error.message);

    return res.status(500).json({
      message: "Unable to save your delivery address.",
    });
  }
});

module.exports = router;
