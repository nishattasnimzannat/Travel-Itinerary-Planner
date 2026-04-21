import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllTrips, Trip } from "../api/trips";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
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

  return (
    <>
      {/* Toggle Button */}
      <button
        style={{
          ...styles.toggleBtn,
          left: isOpen ? "260px" : "0px",
        }}
        onClick={onToggle}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          width: isOpen ? "260px" : "0px",
          overflow: isOpen ? "visible" : "hidden",
        }}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div style={styles.header}>
              <span style={styles.logo}>✈️</span>
              <div>
                <p style={styles.appName}>Travel Planner</p>
                <p style={styles.appSub}>My Trips</p>
              </div>
            </div>

            {/* New Trip Button */}
            <button
              style={styles.newTripBtn}
              onClick={() => navigate("/")}
            >
              + New Trip
            </button>

            {/* Trips List */}
            <div style={styles.tripsList}>
              {loading ? (
                <p style={styles.loadingText}>Loading...</p>
              ) : trips.length === 0 ? (
                <p style={styles.emptyText}>No trips yet.</p>
              ) : (
                trips.map((trip) => {
                  const isActive = trip._id === id;
                  return (
                    <div
                      key={trip._id}
                      style={{
                        ...styles.tripItem,
                        ...(isActive ? styles.tripItemActive : {}),
                      }}
                      onClick={() => navigate(`/trips/${trip._id}`)}
                    >
                      <div style={styles.tripIcon}>✈️</div>
                      <div style={styles.tripInfo}>
                        <p style={{
                          ...styles.tripName,
                          color: isActive ? "#4f46e5" : "#1a1a2e",
                        }}>
                          {trip.tripName}
                        </p>
                        <p style={styles.tripDest}>📍 {trip.destination}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <button
                style={styles.allTripsBtn}
                onClick={() => navigate("/trips")}
              >
                🌍 View All Trips
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toggleBtn: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1000,
    width: "24px",
    height: "48px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    transition: "left 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    backgroundColor: "#fff",
    boxShadow: "2px 0 16px rgba(0,0,0,0.08)",
    zIndex: 999,
    transition: "width 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 16px 16px",
    borderBottom: "1px solid #f0f0f0",
  },
  logo: {
    fontSize: "28px",
    width: "44px",
    height: "44px",
    backgroundColor: "#eef2ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: 0,
  },
  appSub: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
  },
  newTripBtn: {
    margin: "16px",
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
  tripsList: {
    flex: 1,
    overflowY: "auto",
    padding: "0 8px",
  },
  loadingText: {
    fontSize: "13px",
    color: "#aaa",
    textAlign: "center",
    padding: "20px 0",
  },
  emptyText: {
    fontSize: "13px",
    color: "#aaa",
    textAlign: "center",
    padding: "20px 0",
  },
  tripItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 8px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "4px",
    transition: "background 0.15s",
  },
  tripItemActive: {
    backgroundColor: "#eef2ff",
  },
  tripIcon: {
    fontSize: "16px",
    width: "32px",
    height: "32px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tripInfo: { flex: 1, minWidth: 0 },
  tripName: {
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  tripDest: {
    fontSize: "12px",
    color: "#888",
    margin: "2px 0 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  footer: {
    padding: "16px",
    borderTop: "1px solid #f0f0f0",
  },
  allTripsBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#f8f9ff",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default Sidebar;