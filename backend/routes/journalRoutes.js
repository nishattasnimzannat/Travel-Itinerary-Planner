const express = require("express");
const router = express.Router();
const JournalEntry = require("../models/JournalEntry");

router.post("/", async (req, res) => {
  try {
    const { tripId, title, content, tripDate, activity } = req.body;

    if (!tripId || !title || !content) {
      return res.status(400).json({ message: "Trip, title, and content are required" });
    }

    const today = new Date().toISOString().split("T")[0];

    const newEntry = new JournalEntry({
      tripId,
      title,
      content,
      tripDate,
      activity,
      entryDate: today,
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(500).json({ message: "Failed to create journal entry" });
  }
});

router.get("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { date } = req.query;

    let filter = { tripId };

    if (date) {
      filter.tripDate = date;
    }

    const entries = await JournalEntry.find(filter).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, content, tripDate, activity } = req.body;

    const updatedEntry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      { title, content, tripDate, activity },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: "Failed to update journal entry" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedEntry = await JournalEntry.findByIdAndDelete(req.params.id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    res.json({ message: "Journal entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete journal entry" });
  }
});

module.exports = router;