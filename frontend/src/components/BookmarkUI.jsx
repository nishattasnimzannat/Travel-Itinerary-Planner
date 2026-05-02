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
    <div className="container">
      <div className="card">
        <h2 className="title">Favorite / Bookmark Management</h2>

        <div className="button-group">
          <button className="btn" onClick={() => setFavoritesOnly(false)}>
            All Trips
          </button>
          <button className="btn" onClick={() => setFavoritesOnly(true)}>
            Favorite Trips
          </button>
        </div>

      {favoritesOnly && (
        <input
          className="input"
          type="text"
          placeholder="Search favorite trips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {filteredTrips.length === 0 ? (
        <div className="card">
         <p>No trips found.</p>
        </div>
      ) : (
        filteredTrips.map((trip) => (
          <div key={trip._id} className="card">
            <h3>{trip.title}</h3>
            <p><strong>Destination:</strong> {trip.destination}</p>
            <p>
              <strong>Status:</strong>{" "}
              {trip.isFavorite ? "Bookmarked" : "Not Bookmarked"}
            </p>
            <button className="btn" onClick={() => toggleFavorite(trip._id)}>
              {trip.isFavorite ? "Remove Bookmark" : "Add Bookmark"}
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);
}
export default BookMarkUI;