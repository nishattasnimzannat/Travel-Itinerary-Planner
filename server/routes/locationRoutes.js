import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/countries", async (_req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all?fields=name");
    const countries = response.data
      .map((item) => item?.name?.common)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({ countries });
  } catch (_error) {
    return res.status(500).json({ error: "Unable to load countries list." });
  }
});

router.get("/cities", async (req, res) => {
  try {
    const country = String(req.query.country || "").trim();
    if (!country) {
      return res.status(400).json({ error: "Country query parameter is required." });
    }

    const response = await axios.post("https://countriesnow.space/api/v0.1/countries/cities", {
      country,
    });

    const cities = Array.isArray(response.data?.data) ? response.data.data : [];
    return res.status(200).json({ country, cities });
  } catch (_error) {
    return res.status(200).json({ country: req.query.country, cities: [] });
  }
});

export default router;
