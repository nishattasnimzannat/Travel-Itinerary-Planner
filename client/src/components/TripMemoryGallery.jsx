import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

export default function TripMemoryGallery() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tripForm, setTripForm] = useState({ name: "", destination: "" });
  const [photoTripId, setPhotoTripId] = useState("");
  const [files, setFiles] = useState([]);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip._id === photoTripId) || null,
    [trips, photoTripId]
  );

  const fetchTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/memory/trips`);
      const list = res.data.trips || [];
      setTrips(list);
      if (!photoTripId && list.length) setPhotoTripId(list[0]._id);
    } catch (_err) {
      setError("Unable to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const createTrip = async (event) => {
    event.preventDefault();
    if (!tripForm.name) {
      setError("Trip name is required.");
      return;
    }
    const payload = {
      name: tripForm.name.trim(),
      destination: tripForm.destination.trim(),
    };
    const res = await axios.post(`${API_BASE_URL}/api/memory/trips`, payload);
    setTripForm({ name: "", destination: "" });
    setPhotoTripId(res.data?.trip?._id || photoTripId);
    await fetchTrips();
  };

  const markComplete = async (tripId) => {
    await axios.patch(`${API_BASE_URL}/api/memory/trips/${tripId}/complete`);
    await fetchTrips();
  };

  const uploadPhotos = async (event) => {
    event.preventDefault();
    if (!photoTripId || files.length === 0) {
      setError("Select a trip and at least one image.");
      return;
    }
    const body = new FormData();
    files.forEach((file) => body.append("photos", file));
    const res = await axios.post(`${API_BASE_URL}/api/memory/trips/${photoTripId}/photos`, body);
    const updatedTrip = res.data?.trip;
    if (updatedTrip?._id) {
      setTrips((prev) => prev.map((trip) => (trip._id === updatedTrip._id ? updatedTrip : trip)));
    }
    setFiles([]);
    setPhotoTripId(photoTripId);
  };

  const removePhoto = async (tripId, photoId) => {
    await axios.delete(`${API_BASE_URL}/api/memory/trips/${tripId}/photos/${photoId}`);
    await fetchTrips();
  };

  const buildPhotoSrc = (photo) => {
    if (photo.photoUrl) return `${API_BASE_URL}${photo.photoUrl}`;
    if (photo.filePath) {
      const normalized = photo.filePath.replace(/\\/g, "/");
      const uploadsIdx = normalized.indexOf("/uploads/");
      if (uploadsIdx >= 0) return `${API_BASE_URL}${normalized.slice(uploadsIdx)}`;
    }
    return "";
  };

  return (
    <section className="card">
      <h2>Feature 5: Trip Completion and Memory Gallery</h2>
      <form className="weather-form" onSubmit={createTrip}>
        <label>
          Trip name
          <input
            value={tripForm.name}
            onChange={(e) => setTripForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Autumn Vacation"
          />
        </label>
        <label>
          Destination
          <input
            value={tripForm.destination}
            onChange={(e) => setTripForm((prev) => ({ ...prev, destination: e.target.value }))}
            placeholder="Enter destination (optional)"
            autoComplete="off"
          />
        </label>
        <button type="submit">Create Trip</button>
      </form>

      <form className="weather-form" onSubmit={uploadPhotos}>
        <label>
          Select trip
          <select value={photoTripId} onChange={(e) => setPhotoTripId(e.target.value)}>
            <option value="">Choose trip</option>
            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip.name} ({trip.status})
              </option>
            ))}
          </select>
        </label>
        <label>
          Upload photos
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </label>
        <button type="submit">Upload Photos</button>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p>Loading trips...</p> : null}

      <div className="list-stack">
        {trips.map((trip) => (
          <article key={trip._id} className="row-card">
            <div>
              <strong>{trip.name}</strong>
              <p>
                {trip.destination || "No destination"} - {trip.status}
              </p>
            </div>
            <div className="row-actions">
              {trip.status !== "completed" ? (
                <button type="button" onClick={() => markComplete(trip._id)}>
                  Mark Completed
                </button>
              ) : (
                <span className="ok-pill">Completed</span>
              )}
            </div>
          </article>
        ))}
      </div>

      {selectedTrip ? (
        <div>
          <h3>{selectedTrip.name} Photo Gallery</h3>
          {(selectedTrip.photos || []).length ? (
            <div className="photo-grid">
              {(selectedTrip.photos || []).map((photo) => (
                <div key={photo._id} className="photo-card">
                  <img src={buildPhotoSrc(photo)} alt={photo.originalName} />
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removePhoto(selectedTrip._id, photo._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No photos uploaded for this trip yet.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
