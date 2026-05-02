const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); 
const Trip = require("../models/Trip");
const JournalEntry = require("../models/JournalEntry");
const PackingItem = require("../models/PackingItem");

router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trips" });
  }
});

router.get("/favorites", async (req, res) => {
  try {
    const trips = await Trip.find({ isFavorite: true }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch favorite trips" });
  }
});

router.patch("/:id/favorite", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    trip.isFavorite = !trip.isFavorite;
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "Failed to update favorite status" });
  }
});

// ================= CLONE TRIP =================
router.post("/:id/clone", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const originalTrip = await Trip.findById(req.params.id).session(session);

    if (!originalTrip) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Trip not found" });
    }

    const { newTitle, newStartDate, newEndDate } = req.body;

    // 1. Clone Trip
    const newTrip = new Trip({
      title: newTitle || originalTrip.title + " (Copy)",
      destination: originalTrip.destination,
      startDate: newStartDate || originalTrip.startDate,
      endDate: newEndDate || originalTrip.endDate,
    });

    const savedTrip = await newTrip.save({ session });

    // 2. Clone Journal Entries
    const journalEntries = await JournalEntry.find({
      tripId: req.params.id,
    }).session(session);

    const newJournalEntries = journalEntries.map((entry) => ({
      tripId: savedTrip._id,
      title: entry.title,
      content: entry.content,
      tripDate: entry.tripDate,
      activity: entry.activity,
      entryDate: entry.entryDate,
    }));

    if (newJournalEntries.length > 0) {
      await JournalEntry.insertMany(newJournalEntries, { session });
    }

    // 3. Clone Packing Items
    const packingItems = await PackingItem.find({
      tripId: req.params.id,
    }).session(session);

    const newPackingItems = packingItems.map((item) => ({
      tripId: savedTrip._id,
      name: item.name,
      quantity: item.quantity,
      isPacked: item.isPacked,
    }));

    if (newPackingItems.length > 0) {
      await PackingItem.insertMany(newPackingItems, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Trip duplicated successfully",
      trip: savedTrip,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);

    res.status(500).json({
      message: "Duplication failed. No data was changed.",
    });
  }
});

module.exports = router;