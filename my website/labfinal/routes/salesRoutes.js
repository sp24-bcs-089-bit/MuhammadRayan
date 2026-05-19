const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { isLoggedIn, isAdmin } = require("../middleware/auth");

async function getSalesStats() {
  const orders = await Order.find().populate("items.product");

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  const productSales = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const id = item.product?._id?.toString() || item.product?.toString();
      if (!id) return;
      if (!productSales[id]) {
        productSales[id] = { name: item.name, totalSold: 0, revenue: 0 };
      }
      productSales[id].totalSold += item.quantity;
      productSales[id].revenue += item.price * item.quantity;
    });
  });

  let topProduct = null;
  let maxSold = 0;
  for (const id in productSales) {
    if (productSales[id].totalSold > maxSold) {
      maxSold = productSales[id].totalSold;
      topProduct = productSales[id];
    }
  }

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "username email");

  return { totalRevenue, totalOrders, topProduct, recentOrders };
}

// GET /sales
router.get("/", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const stats = await getSalesStats();
    res.render("admin/sales", { ...stats });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading sales dashboard");
  }
});

// GET /api/sales-data
router.get("/api/sales-data", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { totalRevenue, totalOrders, topProduct } = await getSalesStats();
    res.json({ totalRevenue, totalOrders, topProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
});

module.exports = router;