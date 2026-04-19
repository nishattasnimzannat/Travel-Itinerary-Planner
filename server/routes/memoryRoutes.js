import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import { isMongoEnabled } from "../config/db.js";
import { memoryStore } from "../store/memoryStore.js";

const router = express.Router();

const uploadDir = path.resolve("./uploads/gallery");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed."));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

const toClientPhoto = (photo) => ({
  ...photo,
  photoUrl: `/uploads/gallery/${photo.fileName}`,
});

const toClientTrip = (trip) => ({
  ...trip,
  photos: (trip.photos || []).map(toClientPhoto),
});

router.get("/trips", async (_req, res) => {
  if (isMongoEnabled()) {
    const trips = await Trip.find().sort({ createdAt: -1 });
    return res.status(200).json({ trips: trips.map((trip) => toClientTrip(trip.toObject())) });
  }
  return res.status(200).json({ trips: memoryStore.trips.map(toClientTrip) });
});

router.post("/trips", async (req, res) => {
  const { name, destination } = req.body;
  if (!name) return res.status(400).json({ error: "Trip name is required." });

  const payload = {
    name,
    destination: destination || "",
    status: "ongoing",
    photos: [],
  };

  if (isMongoEnabled()) {
    const trip = await Trip.create(payload);
    return res.status(201).json({ trip: toClientTrip(trip.toObject()) });
  }

  const trip = {
    ...payload,
    _id: new mongoose.Types.ObjectId().toString(),
    createdAt: new Date().toISOString(),
  };
  memoryStore.trips.unshift(trip);
  return res.status(201).json({ trip: toClientTrip(trip) });
});

router.patch("/trips/:id/complete", async (req, res) => {
  const id = req.params.id;
  if (isMongoEnabled()) {
    const trip = await Trip.findByIdAndUpdate(id, { status: "completed" }, { new: true });
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    return res.status(200).json({ trip: toClientTrip(trip.toObject()) });
  }

  const trip = memoryStore.trips.find((item) => item._id === id);
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  trip.status = "completed";
  return res.status(200).json({ trip: toClientTrip(trip) });
});

router.post("/trips/:id/photos", upload.array("photos", 10), async (req, res) => {
  const id = req.params.id;
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: "At least one image is required." });

  const toPhoto = (file) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    createdAt: new Date().toISOString(),
  });

  if (isMongoEnabled()) {
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    const photos = files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
    }));
    trip.photos.push(...photos);
    await trip.save();
    return res.status(200).json({ trip: toClientTrip(trip.toObject()) });
  }

  const trip = memoryStore.trips.find((item) => item._id === id);
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  trip.photos.push(...files.map(toPhoto));
  return res.status(200).json({ trip: toClientTrip(trip) });
});

router.delete("/trips/:tripId/photos/:photoId", async (req, res) => {
  const { tripId, photoId } = req.params;

  if (isMongoEnabled()) {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    const photo = trip.photos.id(photoId);
    if (!photo) return res.status(404).json({ error: "Photo not found." });
    const filePath = photo.filePath;
    photo.deleteOne();
    await trip.save();
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(200).json({ trip: toClientTrip(trip.toObject()) });
  }

  const trip = memoryStore.trips.find((item) => item._id === tripId);
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  const idx = trip.photos.findIndex((item) => item._id === photoId);
  if (idx < 0) return res.status(404).json({ error: "Photo not found." });
  const [photo] = trip.photos.splice(idx, 1);
  if (photo?.filePath && fs.existsSync(photo.filePath)) fs.unlinkSync(photo.filePath);
  return res.status(200).json({ trip: toClientTrip(trip) });
});

export default router;
