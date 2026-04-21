const express = require("express");
const router = express.Router({ mergeParams: true });
const DayPlan = require("../models/DayPlan");
const Trip = require("../models/Trip");

// GET /api/trips/:tripId/days - Get all day plans for a trip
router.get("/", async (req, res) => {
  try {
    const dayPlans = await DayPlan.find({ tripId: req.params.tripId }).sort({ day: 1 });
    res.json(dayPlans);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/trips/:tripId/days - Add a day plan
router.post("/", async (req, res) => {
  try {
    const { day, location, notes } = req.body;

    if (!day || !location) {
      return res.status(400).json({ message: "Day and location are required" });
    }

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const dayPlan = await DayPlan.create({
      tripId: req.params.tripId,
      day,
      location,
      notes,
    });

    res.status(201).json(dayPlan);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/trips/:tripId/days/:planId - Update a day plan
router.put("/:planId", async (req, res) => {
  try {
    const { location, notes } = req.body;

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    const dayPlan = await DayPlan.findByIdAndUpdate(
      req.params.planId,
      { location, notes },
      { new: true, runValidators: true }
    );

    if (!dayPlan) return res.status(404).json({ message: "Day plan not found" });
    res.json(dayPlan);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/trips/:tripId/days/:planId - Delete a day plan
router.delete("/:planId", async (req, res) => {
  try {
    const dayPlan = await DayPlan.findByIdAndDelete(req.params.planId);
    if (!dayPlan) return res.status(404).json({ message: "Day plan not found" });
    res.json({ message: "Day plan deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;