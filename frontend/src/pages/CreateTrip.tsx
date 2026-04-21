import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTrip } from "../api/trips";

const CreateTrip: React.FC = () => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!tripName || !destination || !startDate || !endDate) {
      setError("Please fill in all fields.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setLoading(true);
      const trip = await createTrip({ tripName, destination, startDate, endDate });
navigate(`/trips/${trip._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>✈️ Plan a New Trip</h1>
        <p style={styles.subtitle}>Fill in the details to create your itinerary</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>Trip created successfully! 🎉</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Trip Name</label>
            <input
              type="text"
              placeholder="e.g. My Paris Visit"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              style={styles.input}
            />
        </div>
          <div style={styles.field}>
            <label style={styles.label}>Destination</label>
            <input
              type="text"
              placeholder="e.g. Paris, France"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Saving..." : "Create Trip"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4ff",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: 0,
  },
  subtitle: {
    color: "#666",
    marginTop: "6px",
    marginBottom: "28px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  row: { display: "flex", gap: "16px" },
  label: { fontSize: "14px", fontWeight: 600, color: "#333" },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "4px",
  },
  error: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  success: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};

export default CreateTrip;