console.log("file started");
    
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/testDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Basic route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});