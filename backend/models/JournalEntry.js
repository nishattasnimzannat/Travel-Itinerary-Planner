const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tripDate: {
      type: String,
      default: "",
    },
    activity: {
      type: String,
      default: "",
      trim: true,
    },
    entryDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);