require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const tripRoutes = require("./routes/trips");
const dayPlanRoutes = require("./routes/dayPlans");
const activityRoutes = require("./routes/activities");

const app = express();

// 🔧 Optional but recommended
mongoose.set("strictQuery", true);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/trips", tripRoutes);
app.use("/api/trips/:tripId/days", dayPlanRoutes);
app.use("/api/trips/:tripId/days/:planId/activities", activityRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB FIRST, then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });