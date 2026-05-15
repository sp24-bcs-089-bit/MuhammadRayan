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
const { isLoggedIn, isAdmin } = require("./middleware/auth");

const app = express();

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// body parsing middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// connect to MongoDB first, then set up session store and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    // session setup — created AFTER mongoose is connected so MongoStore works reliably
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "mysecretkey",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client: mongoose.connection.getClient(),
        }),
        cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
      })
    );

    // flash messages
    app.use(flash());

    // global variables for all views
    app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currentUser = req.session.user || null;
      next();
    });

    // home route
    app.get("/", (req, res) => {
      res.render("index");
    });

    // routes
    app.use("/products", productRoutes);
    app.use("/cart", isLoggedIn, cartRoutes);
    app.use("/admin", isLoggedIn, isAdmin, adminRoutes);
    app.use("/auth", authRoutes);
    app.use("/api/v1/auth", apiAuthRoutes);
    app.use("/api/v1", apiRoutes);

    // start server
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000")
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });