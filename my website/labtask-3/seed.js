require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const products = [
    {
        name: "Coffee Tumbler",
        price: 2500,
        category: "Accessories",
        rating: 4.5,
        stock: 20,
        image: "/images/tumbler.webp"
    },
    {
        name: "Signature Roast Bag",
        price: 1500,
        category: "Coffee",
        rating: 4.2,
        stock: 40,
        image: "/images/coffeebag.jpeg"
    },
    {
        name: "Barista Cap",
        price: 1200,
        category: "Apparel",
        rating: 4.0,
        stock: 35,
        image: "/images/cap.jpeg"
    },
    {
        name: "Coffee Gift Card",
        price: 5000,
        category: "Gifts",
        rating: 4.8,
        stock: 100,
        image: "/images/giftcard.webp"
    },
    {
        name: "Cold Brew Cans Pack",
        price: 950,
        category: "Coffee",
        rating: 4.6,
        stock: 60,
        image: "/images/cans.webp"
    },
    {
        name: "Espresso Blend Bag",
        price: 1800,
        category: "Coffee",
        rating: 4.4,
        stock: 30,
        image: "/images/coffeebag.jpeg"
    },
    {
        name: "Single Origin Ethiopia",
        price: 2200,
        category: "Coffee",
        rating: 4.7,
        stock: 25,
        image: "/images/coffeebag.jpeg"
    },
    {
        name: "Decaf House Blend",
        price: 1600,
        category: "Coffee",
        rating: 4.1,
        stock: 20,
        image: "/images/coffeebag.jpeg"
    },
    {
        name: "Iced Latte Can",
        price: 450,
        category: "Coffee",
        rating: 4.3,
        stock: 80,
        image: "/images/cans.webp"
    },
    {
        name: "Nitro Cold Brew Can",
        price: 550,
        category: "Coffee",
        rating: 4.5,
        stock: 70,
        image: "/images/cans.webp"
    },
    {
        name: "Brew at Home Kit",
        price: 3500,
        category: "Gifts",
        rating: 4.6,
        stock: 15,
        image: "/images/giftcard.webp"
    },
    {
        name: "Third Class Tumbler XL",
        price: 3200,
        category: "Accessories",
        rating: 4.4,
        stock: 18,
        image: "/images/tumbler.webp"
    },
    {
        name: "Mocha Blend Bag",
        price: 1700,
        category: "Coffee",
        rating: 4.3,
        stock: 35,
        image: "/images/coffeebag.jpeg"
    },
    {
        name: "Barista Hoodie",
        price: 4500,
        category: "Apparel",
        rating: 4.2,
        stock: 22,
        image: "/images/cap.jpeg"
    },
    {
        name: "Coffee Lover Gift Box",
        price: 7500,
        category: "Gifts",
        rating: 4.9,
        stock: 10,
        image: "/images/giftcard.webp"
    }
];

async function seedData() {
    try {
        await Product.deleteMany();
        await Product.insertMany(products);
        console.log("Products Seeded Successfully");
        mongoose.connection.close();
    } catch (error) {
        console.log(error);
    }
}

seedData();