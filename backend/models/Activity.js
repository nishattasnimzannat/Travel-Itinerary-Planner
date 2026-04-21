const mongoose = require("mongoose");

const CATEGORIES = [
  "None",
  "Sightseeing",
  "Dining",
  "Adventure",
  "Shopping",
  "Entertainment",
  "Relaxation",
  "Transport",
];

const activitySchema = new mongoose.Schema(
  {
    dayPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DayPlan",
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: "None",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);