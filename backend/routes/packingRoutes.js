const express = require("express");
const router = express.Router();
const PackingItem = require("../models/PackingItem");

// Get all checklist items for one trip
router.get("/:tripId", async (req, res) => {
  try {
    const items = await PackingItem.find({ tripId: req.params.tripId }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch packing items" });
  }
});

// Add new checklist item
router.post("/", async (req, res) => {
  try {
    const { tripId, itemName, category } = req.body;

    if (!tripId || !itemName || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingItem = await PackingItem.findOne({
      tripId,
      itemName: itemName.trim(),
      category: category.trim(),
    });

    if (existingItem) {
      return res.status(400).json({ message: "Duplicate item already exists" });
    }

    const newItem = await PackingItem.create({
      tripId,
      itemName,
      category,
      packed: false,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to add packing item" });
  }
});

// Update item name/category
router.put("/:id", async (req, res) => {
  try {
    const { itemName, category } = req.body;

    const updatedItem = await PackingItem.findByIdAndUpdate(
      req.params.id,
      { itemName, category },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to update packing item" });
  }
});

// Toggle packed/unpacked
router.patch("/:id/toggle", async (req, res) => {
  try {
    const item = await PackingItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.packed = !item.packed;
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update packed status" });
  }
});

// Delete item
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await PackingItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete packing item" });
  }
});

module.exports = router;