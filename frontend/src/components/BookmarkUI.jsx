import { useEffect, useState } from "react";

function BookMarkUI() {
  const [trips, setTrips] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTrips = async () => {
    try {
      const url = favoritesOnly
        ? "http://localhost:3000/api/trips/favorites"
        : "http://localhost:3000/api/trips";

      const res = await fetch(url);
      const data = await res.json();
      setTrips(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [favoritesOnly]);

  const toggleFavorite = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/trips/${id}/favorite`, {
        method: "PATCH",
      });

      fetchTrips();
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const filteredTrips = trips.filter((trip) =>
    trip.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Favorite / Bookmark Management</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setFavoritesOnly(false)} style={{ marginRight: "10px" }}>
          All Trips
        </button>

        <button onClick={() => setFavoritesOnly(true)}>
          Favorite Trips
        </button>
      </div>

      {favoritesOnly && (
        <input
          type="text"
          placeholder="Search favorite trips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginBottom: "20px", width: "250px" }}
        />
      )}

      {filteredTrips.length === 0 ? (
        <p>No trips found.</p>
      ) : (
        filteredTrips.map((trip) => (
          <div
            key={trip._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ margin: 0 }}>{trip.title}</h3>
            <p style={{ margin: "8px 0" }}>Destination: {trip.destination}</p>
            <p style={{ margin: "8px 0" }}>
              Status: {trip.isFavorite ? "Bookmarked" : "Not Bookmarked"}
            </p>
            <button onClick={() => toggleFavorite(trip._id)}>
              {trip.isFavorite ? "Remove Bookmark" : "Add Bookmark"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default BookMarkUI;