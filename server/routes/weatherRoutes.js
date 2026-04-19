import express from "express";
import axios from "axios";

const router = express.Router();

const weatherCodeMap = {
  0: { weather: "Clear", description: "Clear sky", icon: "01d" },
  1: { weather: "Mainly clear", description: "Mainly clear", icon: "02d" },
  2: { weather: "Partly cloudy", description: "Partly cloudy", icon: "03d" },
  3: { weather: "Cloudy", description: "Overcast", icon: "04d" },
  45: { weather: "Fog", description: "Fog", icon: "50d" },
  48: { weather: "Fog", description: "Depositing rime fog", icon: "50d" },
  51: { weather: "Drizzle", description: "Light drizzle", icon: "09d" },
  53: { weather: "Drizzle", description: "Moderate drizzle", icon: "09d" },
  55: { weather: "Drizzle", description: "Dense drizzle", icon: "09d" },
  61: { weather: "Rain", description: "Slight rain", icon: "10d" },
  63: { weather: "Rain", description: "Moderate rain", icon: "10d" },
  65: { weather: "Rain", description: "Heavy rain", icon: "10d" },
  71: { weather: "Snow", description: "Slight snow", icon: "13d" },
  73: { weather: "Snow", description: "Moderate snow", icon: "13d" },
  75: { weather: "Snow", description: "Heavy snow", icon: "13d" },
  80: { weather: "Rain showers", description: "Slight rain showers", icon: "09d" },
  81: { weather: "Rain showers", description: "Moderate rain showers", icon: "09d" },
  82: { weather: "Rain showers", description: "Violent rain showers", icon: "09d" },
  95: { weather: "Thunderstorm", description: "Thunderstorm", icon: "11d" },
};

router.get("/:destination", async (req, res) => {
  const { destination } = req.params;
  const { startDate, endDate } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    if (apiKey && apiKey !== "YOUR_OPENWEATHERMAP_API_KEY") {
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params: {
            q: destination,
            units: "metric",
            appid: apiKey,
          },
        }
      );

      const forecast = response.data.list.map((item) => ({
        date: item.dt_txt,
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        weather: item.weather[0].main,
        description: item.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      }));

      let filteredForecast = forecast;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredForecast = forecast.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= start && itemDate <= end;
        });
      }

      return res.status(200).json({
        city: response.data.city.name,
        country: response.data.city.country,
        destination: `${response.data.city.name}, ${response.data.city.country}`,
        forecast: filteredForecast,
      });
    }

    // Fallback forecast provider if OpenWeather API key is missing.
    const geoRes = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: { name: destination, count: 1, language: "en", format: "json" },
    });
    const place = geoRes.data?.results?.[0];
    if (!place) {
      return res.status(404).json({ error: "Location not found." });
    }

    const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: place.latitude,
        longitude: place.longitude,
        hourly: "temperature_2m,apparent_temperature,weathercode",
        timezone: "auto",
        start_date: startDate,
        end_date: endDate,
      },
    });

    const times = weatherRes.data?.hourly?.time || [];
    const temperatures = weatherRes.data?.hourly?.temperature_2m || [];
    const feelsLike = weatherRes.data?.hourly?.apparent_temperature || [];
    const weatherCodes = weatherRes.data?.hourly?.weathercode || [];

    const forecast = times
      .map((time, idx) => ({
        date: time.replace("T", " "),
        temperature: temperatures[idx],
        feelsLike: feelsLike[idx],
        weather: weatherCodeMap[weatherCodes[idx]]?.weather || "Weather update",
        description:
          weatherCodeMap[weatherCodes[idx]]?.description || "Forecast available",
        icon: `https://openweathermap.org/img/wn/${
          weatherCodeMap[weatherCodes[idx]]?.icon || "03d"
        }@2x.png`,
      }))
      .filter((_item, idx) => idx % 3 === 0);

    return res.status(200).json({
      city: place.name,
      country: place.country,
      destination: `${place.name}, ${place.country}`,
      forecast,
    });
  } catch (error) {
    const message = error?.response?.data?.message || "Failed to fetch weather data.";
    return res.status(500).json({ error: message });
  }
});

export default router;
