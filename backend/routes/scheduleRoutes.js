const express = require("express");
const router = express.Router();
const ScheduleItem = require("../models/ScheduleItem");

// GET by trip
router.get("/:tripId", async (req, res) => {
  const items = await ScheduleItem.find({ tripId: req.params.tripId })
    .sort({ date: 1, startTime: 1 });

  res.json(items);
});

// GET ALL schedules (GLOBAL VIEW)
router.get("/", async (req, res) => {
  try {
    const schedules = await ScheduleItem.find()
      .populate("tripId", "title"); // get trip name

    const formatted = schedules.map(item => ({
      ...item._doc,
      tripTitle: item.tripId?.title
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD activity (with overlap check)
router.post("/", async (req, res) => {
  const { tripId, title, date, startTime, endTime } = req.body;

  if (!tripId || !title || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields required" });
  }

  // 🚨 OVERLAP CHECK
  const conflict = await ScheduleItem.findOne({
    tripId,
    date,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  });

  if (conflict) {
    return res.status(400).json({ message: "Time overlap detected!" });
  }

  const item = await ScheduleItem.create(req.body);
  res.status(201).json(item);
});


// UPDATE
router.put("/:id", async (req, res) => {
  const updated = await ScheduleItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});


// TOGGLE STATUS
router.patch("/:id/status", async (req, res) => {
  const item = await ScheduleItem.findById(req.params.id);
  item.status = item.status === "pending" ? "completed" : "pending";
  await item.save();

  res.json(item);
});


// DELETE
router.delete("/:id", async (req, res) => {
  await ScheduleItem.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;