const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register page
router.get("/register", (req, res) => {
  console.log("🔥 AUTH REGISTER ROUTE HIT");
  res.render("auth/register");
});

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      console.log("[REGISTER FAIL] Empty fields — body received:", req.body);
      req.flash("error", "All fields are required");
      return res.redirect("/auth/register");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("[REGISTER FAIL] Email already exists:", email);
      req.flash("error", "Email already registered");
      return res.redirect("/auth/register");
    }

    // only allow "customer" or "admin", default to "customer" if anything else
    const assignedRole = role === "admin" ? "admin" : "customer";

    const user = new User({
      name,
      email,
      password,
      role: assignedRole,
    });

    await user.save();
    console.log("[REGISTER SUCCESS] User created:", email, "| Role:", assignedRole);

    req.flash("success", "Registration successful, please log in!");
    res.redirect("/auth/login");
  } catch (err) {
    console.log("[REGISTER ERROR]", err.message);
    req.flash("error", "Something went wrong: " + err.message);
    res.redirect("/auth/register");
  }
});

// Login page
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("[LOGIN FAIL] Empty fields — body received:", req.body);
      req.flash("error", "Email and password are required");
      return res.redirect("/auth/login");
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log("[LOGIN FAIL] No user found for email:", email);
      req.flash("error", "Invalid email or password");
      return res.redirect("/auth/login");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log("[LOGIN FAIL] Wrong password for email:", email);
      req.flash("error", "Invalid email or password");
      return res.redirect("/auth/login");
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.session.save((err) => {
      if (err) {
        console.log("[LOGIN FAIL] Session save error:", err);
        req.flash("error", "Session error, please try again");
        return res.redirect("/auth/login");
      }

      console.log("[LOGIN SUCCESS] Session saved for:", email, "| Role:", user.role);
      req.flash("success", `Welcome back, ${user.name}!`);

      // redirect based on role
      if (user.role === "admin") {
        return res.redirect("/admin");
      } else {
        return res.redirect("/products");
      }
    });
  } catch (err) {
    console.log("[LOGIN ERROR]", err.message);
    req.flash("error", "Login failed: " + err.message);
    res.redirect("/auth/login");
  }
});

// Logout
router.get("/logout", (req, res) => {
  console.log("[LOGOUT] User logged out:", req.session.user?.email);
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;