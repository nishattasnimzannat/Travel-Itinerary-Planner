import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import TravelDocument from "../models/TravelDocument.js";
import { isMongoEnabled } from "../config/db.js";
import { memoryStore } from "../store/memoryStore.js";

const router = express.Router();

const uploadDir = path.resolve("./uploads/documents");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("Only PDF and image files are supported."));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/", async (_req, res) => {
  if (isMongoEnabled()) {
    const documents = await TravelDocument.find().sort({ createdAt: -1 });
    return res.status(200).json({ documents });
  }
  return res.status(200).json({ documents: memoryStore.documents });
});

router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Document file is required." });

    const payload = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      docType: req.body.docType || "other",
      tripName: req.body.tripName || "",
    };

    if (isMongoEnabled()) {
      const created = await TravelDocument.create(payload);
      return res.status(201).json({ document: created });
    }

    const document = {
      ...payload,
      _id: new mongoose.Types.ObjectId().toString(),
      createdAt: new Date().toISOString(),
    };
    memoryStore.documents.unshift(document);
    return res.status(201).json({ document });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to upload document." });
  }
});

router.get("/:id/view", async (req, res) => {
  const id = req.params.id;
  const doc = isMongoEnabled()
    ? await TravelDocument.findById(id)
    : memoryStore.documents.find((item) => item._id === id);
  if (!doc) return res.status(404).json({ error: "Document not found." });
  return res.sendFile(path.resolve(doc.filePath));
});

router.get("/:id/download", async (req, res) => {
  const id = req.params.id;
  const doc = isMongoEnabled()
    ? await TravelDocument.findById(id)
    : memoryStore.documents.find((item) => item._id === id);
  if (!doc) return res.status(404).json({ error: "Document not found." });
  return res.download(path.resolve(doc.filePath), doc.originalName);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  let doc = null;
  if (isMongoEnabled()) {
    doc = await TravelDocument.findByIdAndDelete(id);
  } else {
    const idx = memoryStore.documents.findIndex((item) => item._id === id);
    if (idx >= 0) {
      doc = memoryStore.documents[idx];
      memoryStore.documents.splice(idx, 1);
    }
  }

  if (!doc) return res.status(404).json({ error: "Document not found." });
  if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
  return res.status(200).json({ message: "Document deleted." });
});

export default router;
