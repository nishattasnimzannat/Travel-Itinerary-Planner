const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  tripId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Trip",  
  required: true
},

  title: { type: String, required: true },
  description: String,
  location: String,

  date: { type: String, required: true },

  startTime: { type: String, required: true },
  endTime: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  }
}, { timestamps: true });

module.exports = mongoose.model("ScheduleItem", scheduleSchema);