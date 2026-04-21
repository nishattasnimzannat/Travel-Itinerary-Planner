const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");

// POST /api/trips - Create a new trip
router.post("/", async (req, res) => {
  try {
    const { tripName, destination, startDate, endDate } = req.body;

    if (!tripName || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const trip = await Trip.create({ tripName, destination, startDate, endDate });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/trips - Get all trips (useful for testing)
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/trips/:id - Get single trip
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/trips/:id - Update a trip
router.put("/:id", async (req, res) => {
  try {
    const { tripName, destination, startDate, endDate, description } = req.body;

    if (!tripName || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { tripName, destination, startDate, endDate, description },
      { new: true, runValidators: true }
    );

    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/trips/:id - Delete a trip
router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Trip deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;