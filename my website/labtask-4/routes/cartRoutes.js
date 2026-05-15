const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET /cart — view cart
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render("cart", { cart, total });
});

// GET /cart/add — add item to cart via link
router.get("/add", async (req, res) => {
  try {
    const productId = req.query.productId;
    const qty = 1;

    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    if (product.stock < 1) {
      req.flash("error", "Product is out of stock");
      return res.redirect("/products");
    }

    req.session.cart = req.session.cart || [];

    const existingIndex = req.session.cart.findIndex(
      (item) => item.productId === productId
    );

    if (existingIndex >= 0) {
      req.session.cart[existingIndex].quantity += qty;
    } else {
      req.session.cart.push({
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
      });
    }

    req.flash("success", `${product.name} added to cart!`);
    res.redirect("/products");
  } catch (err) {
    console.error("[CART ADD ERROR]", err.message);
    req.flash("error", "Could not add to cart");
    res.redirect("/products");
  }
});

// POST /cart/update — update quantity
router.post("/update", (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);

  req.session.cart = req.session.cart || [];

  if (!qty || qty < 1) {
    req.session.cart = req.session.cart.filter(
      (item) => item.productId !== productId
    );
  } else {
    const item = req.session.cart.find((i) => i.productId === productId);
    if (item) item.quantity = qty;
  }

  res.redirect("/cart");
});

// POST /cart/remove — remove one item
router.post("/remove", (req, res) => {
  const { productId } = req.body;
  req.session.cart = (req.session.cart || []).filter(
    (item) => item.productId !== productId
  );
  req.flash("success", "Item removed from cart");
  res.redirect("/cart");
});

// POST /cart/checkout — place order from cart
router.post("/checkout", async (req, res) => {
  try {
    const cart = req.session.cart || [];

    if (cart.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    const items = cart.map((item) => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.session.user._id,
      items,
      total,
      shippingAddress: {},
    });

    await order.save();

    req.session.cart = [];
    req.flash("success", "Order placed successfully!");
    res.redirect("/products");
  } catch (err) {
    console.error("[CART CHECKOUT ERROR]", err.message);
    req.flash("error", "Checkout failed: " + err.message);
    res.redirect("/cart");
  }
});

module.exports = router;