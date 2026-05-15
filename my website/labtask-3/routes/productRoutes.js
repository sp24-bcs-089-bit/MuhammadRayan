const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const search = req.query.search || "";
        const category = req.query.category || "";
        const minPrice = req.query.minPrice || 0;
        const maxPrice = req.query.maxPrice || 100000;

        let filter = {
            name: { $regex: search, $options: "i" },
            price: {
                $gte: Number(minPrice),
                $lte: Number(maxPrice)
            }
        };

        if (category) {
            filter.category = category;
        }

        const totalProducts = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        const categories = await Product.distinct("category");

        res.render("products", {
            products,
            currentPage: page,
            totalPages,
            categories,
            search,
            category,
            minPrice,
            maxPrice
        });

    } catch (error) {
        console.log(error);
        res.send("Server Error");
    }
});

module.exports = router;