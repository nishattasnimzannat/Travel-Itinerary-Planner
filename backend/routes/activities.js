const express = require("express");
const router = express.Router({ mergeParams: true });
const Activity = require("../models/Activity");

// GET /api/trips/:tripId/days/:planId/activities
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find({
      dayPlanId: req.params.planId,
    }).sort({ time: 1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/trips/:tripId/days/:planId/activities
router.post("/", async (req, res) => {
  try {
    const { time, location, description,  category } = req.body;

    if (!time || !location) {
      return res.status(400).json({ message: "Time and location are required" });
    }

    const activity = await Activity.create({
      dayPlanId: req.params.planId,
      tripId: req.params.tripId,
      time,
      location,
      description,
      category: category || "Sightseeing",
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/trips/:tripId/days/:planId/activities/:activityId
router.put("/:activityId", async (req, res) => {
  try {
    const { time, location, description, category } = req.body;

    if (!time || !location) {
      return res.status(400).json({ message: "Time and location are required" });
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.activityId,
      { time, location, description, category },
      { new: true, runValidators: true }
    );

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/trips/:tripId/days/:planId/activities/:activityId
router.delete("/:activityId", async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;