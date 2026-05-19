require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const apiAuthRoutes = require("./routes/apiAuthRoutes");
const apiRoutes = require("./routes/apiRoutes");
const cartRoutes = require("./routes/cartRoutes");
const salesRoutes = require("./routes/salesRoutes");
const { isLoggedIn, isAdmin } = require("./middleware/auth");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.use(
      session({
        secret: process.env.SESSION_SECRET || "mysecretkey",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client: mongoose.connection.getClient(),
        }),
        cookie: { maxAge: 1000 * 60 * 60 },
      })
    );

    app.use(flash());

    app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currentUser = req.session.user || null;
      next();
    });

    app.get("/", (req, res) => {
      res.render("index");
    });

    app.use("/products", productRoutes);
    app.use("/cart", isLoggedIn, cartRoutes);
    app.use("/admin", isLoggedIn, isAdmin, adminRoutes);
    app.use("/auth", authRoutes);
    app.use("/api/v1/auth", apiAuthRoutes);
    app.use("/api/v1", apiRoutes);
    app.use("/sales", isLoggedIn, isAdmin, salesRoutes);
    app.use("/api", isLoggedIn, isAdmin, salesRoutes);

    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000")
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });