require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/products", productRoutes);
app.use("/admin", adminRoutes);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});