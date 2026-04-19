import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import { isMongoEnabled } from "../config/db.js";
import { memoryStore } from "../store/memoryStore.js";

const router = express.Router();

async function resolveCoordinates(locationName) {
  const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: { name: locationName, count: 1, language: "en", format: "json" },
  });
  const result = response.data?.results?.[0];
  if (!result) return null;
  return { lat: result.latitude, lng: result.longitude };
}

router.get("/", async (_req, res) => {
  if (isMongoEnabled()) {
    const activities = await Activity.find().sort({ createdAt: -1 });
    return res.status(200).json({ activities });
  }
  return res.status(200).json({ activities: memoryStore.activities });
});

router.post("/", async (req, res) => {
  try {
    const { title, notes, locationName, country, city, date, lat, lng } = req.body;
    if (!title || !locationName) {
      return res.status(400).json({ error: "Title and locationName are required." });
    }

    let coords = { lat, lng };
    if (typeof coords.lat !== "number" || typeof coords.lng !== "number") {
      const resolved = await resolveCoordinates(
        `${locationName}${city ? `, ${city}` : ""}${country ? `, ${country}` : ""}`
      );
      if (!resolved) {
        return res.status(400).json({ error: "Could not find coordinates for this location." });
      }
      coords = resolved;
    }

    const payload = {
      title,
      notes: notes || "",
      locationName,
      country: country || "",
      city: city || "",
      date: date || "",
      lat: coords.lat,
      lng: coords.lng,
    };

    if (isMongoEnabled()) {
      const created = await Activity.create(payload);
      return res.status(201).json({ activity: created });
    }

    const activity = {
      ...payload,
      _id: new mongoose.Types.ObjectId().toString(),
      createdAt: new Date().toISOString(),
    };
    memoryStore.activities.unshift(activity);
    return res.status(201).json({ activity });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to save activity." });
  }
});

export default router;
