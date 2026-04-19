import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    notes: { type: String, default: "" },
    locationName: { type: String, required: true },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    date: { type: String, default: "" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
