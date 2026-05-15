const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Dashboard - all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.render("admin/dashboard", { products });
    } catch (err) {
        console.log(err);
        res.send("Server Error");
    }
});

// Add product page
router.get("/add", (req, res) => {
    res.render("admin/add");
});

// Add product - handle form
router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const { name, price, category, rating, stock } = req.body;
        const image = req.file ? "/uploads/" + req.file.filename : "";
        await Product.create({ name, price, category, rating, stock, image });
        res.redirect("/admin");
    } catch (err) {
        console.log(err);
        res.send("Error adding product");
    }
});

// Edit product page
router.get("/edit/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render("admin/edit", { product });
    } catch (err) {
        console.log(err);
        res.send("Server Error");
    }
});

// Edit product - handle form
router.post("/edit/:id", upload.single("image"), async (req, res) => {
    try {
        const { name, price, category, rating, stock } = req.body;
        const update = { name, price, category, rating, stock };
        if (req.file) {
            update.image = "/uploads/" + req.file.filename;
        }
        await Product.findByIdAndUpdate(req.params.id, update);
        res.redirect("/admin");
    } catch (err) {
        console.log(err);
        res.send("Error updating product");
    }
});

// Delete product
router.post("/delete/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/admin");
    } catch (err) {
        console.log(err);
        res.send("Error deleting product");
    }
});

module.exports = router;