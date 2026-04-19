import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weatherRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import activitiesRoutes from "./routes/activitiesRoutes.js";
import documentsRoutes from "./routes/documentsRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import fs from "fs";
import { connectMongo } from "./config/db.js";

dotenv.config();
const app = express();
await connectMongo();

// Ensure temp directory exists for PDFs
if (!fs.existsSync("./temp")) { fs.mkdirSync("./temp"); }
if (!fs.existsSync("./uploads")) { fs.mkdirSync("./uploads"); }

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/weather", weatherRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/memory", memoryRoutes);

app.get("/", (_req, res) => {
  res.send("Travel Buddy API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));