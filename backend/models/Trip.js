const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tripName: {
      type: String,
      required: [true, "Trip name is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String,
      default: "anonymous",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema); 