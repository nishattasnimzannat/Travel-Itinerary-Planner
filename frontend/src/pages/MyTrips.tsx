import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTrips, deleteTrip, Trip } from "../api/trips";

const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getAllTrips();
        setTrips(data);
      } catch {
        console.error("Failed to load trips");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert("Failed to delete trip.");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🌍 My Trips</h1>
            <p style={styles.subtitle}>{trips.length} trip{trips.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button style={styles.newTripBtn} onClick={() => navigate("/")}>
            + New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No trips yet!</p>
            <p style={styles.emptySubtext}>Click "+ New Trip" to plan your first adventure.</p>
            <button style={styles.newTripBtn} onClick={() => navigate("/")}>
              + Create First Trip
            </button>
          </div>
        ) : (
          <div style={styles.tripsList}>
            {trips.map((trip) => (
              <div
                key={trip._id}
                style={styles.tripCard}
                onClick={() => navigate(`/trips/${trip._id}`)}
              >
                <div style={styles.tripCardLeft}>
                  <div style={styles.tripBadge}>✈️</div>
                  <div style={styles.tripInfo}>
                    <h2 style={styles.tripName}>{trip.tripName}</h2>
                    <p style={styles.tripDestination}>📍 {trip.destination}</p>
                    <div style={styles.tripMeta}>
                      <span style={styles.tripDates}>
                        {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                      </span>
                      <span style={styles.tripDuration}>
                        {getDuration(trip.startDate, trip.endDate)}
                      </span>
                    </div>
                    {trip.description && (
                      <p style={styles.tripDesc}>{trip.description}</p>
                    )}
                  </div>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={(e) => handleDelete(trip._id, e)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
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
  wrapper: {
    maxWidth: "680px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: 0,
  },
  subtitle: {
    color: "#666",
    marginTop: "4px",
    fontSize: "14px",
  },
  newTripBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  emptyText: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0 0 8px 0",
  },
  emptySubtext: {
    color: "#888",
    marginBottom: "24px",
  },
  tripsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tripCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "border 0.2s",
  },
  tripCardLeft: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    flex: 1,
  },
  tripBadge: {
    fontSize: "24px",
    width: "44px",
    height: "44px",
    backgroundColor: "#eef2ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tripInfo: { flex: 1 },
  tripName: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0 0 4px 0",
  },
  tripDestination: {
    fontSize: "14px",
    color: "#555",
    margin: "0 0 6px 0",
  },
  tripMeta: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  tripDates: {
    fontSize: "13px",
    color: "#888",
  },
  tripDuration: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  tripDesc: {
    fontSize: "13px",
    color: "#888",
    margin: "6px 0 0 0",
    lineHeight: "1.5",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    color: "#dc2626",
    marginLeft: "12px",
  },
};

export default MyTrips;