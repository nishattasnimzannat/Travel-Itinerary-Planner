import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrip, deleteTrip, Trip } from "../api/trips";

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await getTrip(id!);
        setTrip(data);
      } catch {
        setError("Trip not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const handleDelete = async () => {
  if (!window.confirm("Delete this trip? This cannot be undone.")) return;
  try {
    await deleteTrip(trip!._id);
    navigate("/trips");
  } catch {
    alert("Failed to delete trip.");
  }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;
  if (!trip) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <span style={styles.badge}>✈️ Trip</span>
          <h1 style={styles.title}>{trip.tripName}</h1>
          <p style={styles.destination}>📍 {trip.destination}</p>
        </div>

        <div style={styles.dates}>
          <div style={styles.dateBox}>
            <span style={styles.dateLabel}>Start Date</span>
            <span style={styles.dateValue}>{formatDate(trip.startDate)}</span>
          </div>
          <div style={styles.dateDivider}>→</div>
          <div style={styles.dateBox}>
            <span style={styles.dateLabel}>End Date</span>
            <span style={styles.dateValue}>{formatDate(trip.endDate)}</span>
          </div>
        </div>

        {trip.description && (
          <div style={styles.descriptionBox}>
            <span style={styles.dateLabel}>Description</span>
            <p style={styles.descriptionText}>{trip.description}</p>
          </div>
        )}

        <div style={styles.actions}>
          <button
            style={styles.editButton}
            onClick={() => navigate(`/trips/${trip._id}/edit`)}
          >
            ✏️ Edit Trip
          </button>
          <button
            style={styles.itineraryButton}
            onClick={() => navigate(`/trips/${trip._id}/itinerary`)}
          >
            🗓️ View Itinerary
          </button>
          <button
            style={styles.backButton}
            onClick={() => navigate("/")}
          >
            + New Trip
          </button>
          <button style={styles.deleteButton} onClick={handleDelete}>
          🗑️ Delete Trip
          </button>
        </div>

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
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontSize: "16px",
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  header: {
    marginBottom: "28px",
  },
  badge: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "12px 0 6px",
  },
  destination: {
    fontSize: "16px",
    color: "#555",
    margin: 0,
  },
  dates: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#f8f9ff",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "20px",
  },
  dateBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  dateLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dateValue: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#1a1a2e",
  },
  dateDivider: {
    fontSize: "18px",
    color: "#ccc",
  },
  descriptionBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backgroundColor: "#f8f9ff",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "20px",
  },
  descriptionText: {
    fontSize: "15px",
    color: "#444",
    lineHeight: "1.6",
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  editButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  backButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f0f4ff",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  itineraryButton: {
  flex: 1,
  padding: "12px",
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
 },
 deleteButton: {
  flex: 1,
  padding: "12px",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
 },
};

export default TripDetail;