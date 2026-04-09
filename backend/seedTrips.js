const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Trip = require("./models/Trip");

dotenv.config();

const sampleTrips = [
  { title: "Summer Vacation", destination: "Cox's Bazar", isFavorite: false },
  { title: "City Escape", destination: "Dhaka", isFavorite: false },
  { title: "Beach Tour", destination: "Saint Martin", isFavorite: false },
  { title: "Mountain Trip", destination: "Bandarban", isFavorite: false },
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Trip.deleteMany();
    await Trip.insertMany(sampleTrips);

    console.log("Sample trips inserted");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();