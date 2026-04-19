import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

export default function WeatherForecast() {
  const fallbackCitiesByCountry = {
    Bangladesh: ["Dhaka", "Chittagong", "Khulna"],
    UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
    France: ["Paris", "Lyon", "Marseille"],
    Thailand: ["Bangkok", "Chiang Mai", "Phuket"],
    Japan: ["Tokyo", "Osaka", "Kyoto"],
    Canada: ["Toronto", "Vancouver", "Montreal"],
    USA: ["New York", "Los Angeles", "Chicago"],
    UK: ["London", "Manchester", "Birmingham"],
  };

  const today = useMemo(() => new Date(), []);
  const maxForecastDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 5);
    return d;
  }, [today]);
  const toISODate = (d) => d.toISOString().slice(0, 10);

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState("Bangladesh");
  const [city, setCity] = useState("Dhaka");
  const [fromDate, setFromDate] = useState(toISODate(today));
  const [toDate, setToDate] = useState(toISODate(maxForecastDate));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/locations/countries`);
        setCountries(response.data?.countries || []);
      } catch (_err) {
        // Keep form usable even if countries API is blocked.
        setCountries(Object.keys(fallbackCitiesByCountry));
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!country.trim()) {
        setCities([]);
        return;
      }

      setCitiesLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/locations/cities`, {
          params: { country: country.trim() },
        });
        const cityList = Array.isArray(response.data?.cities) ? response.data.cities : [];
        setCities(cityList);
        if (cityList.length > 0 && !cityList.includes(city)) {
          setCity(cityList[0]);
        }
      } catch (_err) {
        const fallback = fallbackCitiesByCountry[country] || [];
        setCities(fallback);
        if (fallback.length > 0 && !fallback.includes(city)) {
          setCity(fallback[0]);
        }
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [country]);

  const getWeather = async () => {
    if (!country || !city) {
      setError("Please enter/select both country and city.");
      return;
    }

    if (!fromDate || !toDate) {
      setError("Please select both from and to dates.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError("From date cannot be later than to date.");
      return;
    }

    if (new Date(fromDate) < new Date(toISODate(today)) || new Date(toDate) > maxForecastDate) {
      setError("Please select a date range within today and the next 5 days.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const destination = `${city},${country}`;
      const res = await axios.get(
        `${API_BASE_URL}/api/weather/${encodeURIComponent(destination.trim())}`,
        { params: { startDate: fromDate, endDate: toDate } }
      );
      setData(res.data);
      if (!res.data.forecast?.length) {
        setError(
          "No forecast found for those days. Select dates between today and next 5 days."
        );
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card weather-card">
      <p className="prompt-line">Put your desired location:</p>

      <div className="weather-form">
        <label>
          Select country:
          <div className="control-pair">
            <input
              list="countries-list"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder={countriesLoading ? "Loading countries..." : "Type country manually"}
            />
            <select
              size={6}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="list-select"
            >
              {countries.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
            <datalist id="countries-list">
              {countries.map((countryName) => (
                <option key={countryName} value={countryName} />
              ))}
            </datalist>
          </div>
        </label>

        <label>
          Select city:
          <div className="control-pair">
            <input
              list="cities-list"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={citiesLoading ? "Loading cities..." : "Type city manually"}
            />
            <select
              size={6}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="list-select"
            >
              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
            <datalist id="cities-list">
              {cities.map((cityName) => (
                <option key={cityName} value={cityName} />
              ))}
            </datalist>
          </div>
        </label>

        <label>
          Select date (from):
          <input
            type="date"
            value={fromDate}
            min={toISODate(today)}
            max={toISODate(maxForecastDate)}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>

        <label>
          Select date (to):
          <input
            type="date"
            value={toDate}
            min={toISODate(today)}
            max={toISODate(maxForecastDate)}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>

        <button type="button" onClick={getWeather} disabled={loading}>
          {loading ? "Loading..." : "Get Forecast"}
        </button>
      </div>

      <p className="hint">Weather API key path: server/.env - WEATHER_API_KEY=your_key</p>

      {error ? <p className="error">{error}</p> : null}

      {data?.forecast?.length ? (
        <>
          <h3>
            {data.city}, {data.country}
          </h3>
          <div className="forecast-grid">
            {data.forecast.slice(0, 10).map((item) => (
              <div key={item.date} className="forecast-item">
                <p>{new Date(item.date).toLocaleString()}</p>
                <img src={item.icon} alt={item.weather} />
                <p>
                  <b>{item.weather}</b> ({item.description})
                </p>
                <p>{item.temperature} C</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
