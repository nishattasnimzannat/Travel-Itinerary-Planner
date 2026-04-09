const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");

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

module.exports = router;