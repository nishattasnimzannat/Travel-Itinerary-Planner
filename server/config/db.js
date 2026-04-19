import mongoose from "mongoose";

let mongoEnabled = false;

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log("MONGO_URI not set. Running with in-memory fallback.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    mongoEnabled = true;
    console.log("MongoDB connected.");
  } catch (error) {
    mongoEnabled = false;
    console.log("MongoDB unavailable. Running with in-memory fallback.");
  }
}

export function isMongoEnabled() {
  return mongoEnabled;
}
