import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { API_BASE_URL } from "../config/api.js";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultCenter = [23.685, 90.3563];

export default function MapViewFeature() {
  const [activities, setActivities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    notes: "",
    country: "",
    city: "",
    date: "",
  });

  const mapCenter = useMemo(() => {
    if (!activities.length) return defaultCenter;
    return [activities[0].lat, activities[0].lng];
  }, [activities]);

  const fetchActivities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/activities`);
      setActivities(res.data.activities || []);
    } catch (_err) {
      setError("Unable to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/locations/countries`);
        const list = res.data?.countries || [];
        setCountries(list);
        if (!form.country && list.length) {
          setForm((prev) => ({ ...prev, country: list[0] }));
        }
      } catch (_err) {
        setError("Unable to load countries.");
      } finally {
        setCountriesLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!form.country) {
        setCities([]);
        return;
      }
      setCitiesLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/locations/cities`, {
          params: { country: form.country },
        });
        const list = res.data?.cities || [];
        setCities(list);
        if (list.length && !list.includes(form.city)) {
          setForm((prev) => ({ ...prev, city: list[0] }));
        }
      } catch (_err) {
        setCities([]);
        setError("Unable to load cities for selected country.");
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, [form.country]);

  const addActivity = async (event) => {
    event.preventDefault();
    if (!form.country || !form.city) {
      setError("Please select country and city.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title?.trim() || `${form.city} Activity`,
        notes: form.notes,
        country: form.country,
        city: form.city,
        locationName: form.city,
        date: form.date,
      };
      await axios.post(`${API_BASE_URL}/api/activities`, payload);
      setForm({
        title: "",
        notes: "",
        country: form.country,
        city: form.city,
        date: "",
      });
      await fetchActivities();
    } catch (_err) {
      setError("Could not add activity.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card">
      <h2>Feature 2: Map View of Activity Locations</h2>
      <form className="weather-form" onSubmit={addActivity}>
        <label>
          Activity title
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Museum visit"
          />
        </label>
        <label>
          Select country
          <select
            value={form.country}
            onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
            disabled={countriesLoading}
          >
            {!countries.length ? <option value="">No countries</option> : null}
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label>
          Select city
          <select
            value={form.city}
            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            disabled={citiesLoading || !form.country}
          >
            {!cities.length ? <option value="">No cities found</option> : null}
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
        </label>
        <label>
          Notes
          <input
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Click marker to see this detail"
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add Activity to Map"}
        </button>
      </form>
      <p className="hint">Select country and city, then the map auto-locates the city.</p>
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p>Loading map data...</p> : null}

      <div className="map-wrap">
        <MapContainer center={mapCenter} zoom={5} scrollWheelZoom style={{ height: "420px" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {activities.map((activity) => (
            <Marker key={activity._id} position={[activity.lat, activity.lng]}>
              <Popup>
                <strong>{activity.title}</strong>
                <br />
                {activity.locationName}
                {activity.city ? `, ${activity.city}` : ""}
                {activity.country ? `, ${activity.country}` : ""}
                <br />
                {activity.date || "No date"}
                <br />
                {activity.notes || "No additional note"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
