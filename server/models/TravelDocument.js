import mongoose from "mongoose";

const travelDocumentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    docType: { type: String, default: "other" },
    tripName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("TravelDocument", travelDocumentSchema);
