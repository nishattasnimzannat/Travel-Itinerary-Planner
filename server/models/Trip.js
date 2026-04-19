import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: true, timestamps: true }
);

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    destination: { type: String, default: "" },
    status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
    photos: { type: [photoSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
