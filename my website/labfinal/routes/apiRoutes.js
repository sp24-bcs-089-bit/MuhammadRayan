const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { verifyToken } = require("../middleware/auth");

router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const category = req.query.category || "";
    const minPrice = Number(req.query.minPrice || 0);
    const maxPrice = Number(req.query.maxPrice || 1000000);

    const filter = {
      name: { $regex: search, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (category) {
      filter.category = category;
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter).skip(skip).limit(limit);
    const totalPages = Math.ceil(totalProducts / limit);

    return res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
      },
    });
  } catch (err) {
    console.error("[API PRODUCTS ERROR]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("[API PRODUCT DETAIL ERROR]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/orders", verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items are required" });
    }

    const validatedItems = [];
    let total = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ error: "Each order item needs a productId and quantity" });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }

      const quantity = Number(item.quantity);
      if (Number.isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Invalid item quantity" });
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });

      total += product.price * quantity;
    }

    const order = new Order({
      user: req.user.user_id,
      items: validatedItems,
      total,
      shippingAddress: shippingAddress || {},
    });

    await order.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error("[API ORDER CREATE ERROR]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("[API USER PROFILE ERROR]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
