import { useEffect, useState } from "react";

function TripjournalUI() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [activity, setActivity] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchTrips = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/trips");
      const data = await res.json();
      setTrips(data);

      setSelectedTripId("");
    } catch (error) {
      console.error("Failed to fetch trips");
    }
  };

  const fetchEntries = async (tripId, date = "") => {
    if (!tripId) return;

    try {
      let url = `http://localhost:3000/api/journal/${tripId}`;
      if (date) {
        url += `?date=${date}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch journal entries");
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchEntries(selectedTripId, filterDate);
    }
  }, [selectedTripId, filterDate]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTripDate("");
    setActivity("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title || !content || !selectedTripId) {
      setMessage("Please fill in title, content, and select a trip");
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`http://localhost:3000/api/journal/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, tripDate, activity }),
        });

        if (!res.ok) {
          setMessage("Failed to update entry");
          return;
        }

        setMessage("Journal entry updated");
      } else {
        const res = await fetch("http://localhost:3000/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId: selectedTripId,
            title,
            content,
            tripDate,
            activity,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setMessage(data.message || "Failed to save entry");
          return;
        }

        setMessage("Journal entry saved");
      }

      resetForm();
      fetchEntries(selectedTripId, filterDate);
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setTitle(entry.title);
    setContent(entry.content);
    setTripDate(entry.tripDate || "");
    setActivity(entry.activity || "");
    setMessage("");
  };

  const deleteEntry = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/api/journal/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setMessage("Failed to delete entry");
        return;
      }

      setMessage("Journal entry deleted");
      fetchEntries(selectedTripId, filterDate);
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const cloneTrip = async (tripId) => {
  try {
    const newTitle = prompt("Enter new trip name:");
    const newStartDate = prompt("Enter new start date (YYYY-MM-DD):");
    const newEndDate = prompt("Enter new end date (YYYY-MM-DD):");

    const res = await fetch(`http://localhost:3000/api/trips/${tripId}/clone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newTitle, newStartDate, newEndDate }),
    });

    const data = await res.json();

    alert(data.message);

    // refresh trips list
    const updatedTrips = await fetch("http://localhost:3000/api/trips");
    const tripsData = await updatedTrips.json();
    setTrips(tripsData);

  } catch (error) {
    console.error("Clone failed:", error);
  }
};

  return (
    <div className="container">
      <div className="card">
        < h2 className="title">Trip Notes & Journal</h2>

        <label><strong>Select Trip: </strong></label>
        <select
          className="input"
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          
        >
          <option value="">-- Select Trip --</option>
          {trips.map((trip) => (
            <option key={trip._id} value={trip._id}>
              {trip.title} - {trip.destination}
              {trip.startDate && trip.endDate
                ? ` (${trip.startDate} → ${trip.endDate})`
                : ""}
            </option>
          ))}
        </select>
        <button className="btn" onClick={() => cloneTrip(selectedTripId)}>     
          Clone Trip
        </button>
        <br /><br />
      <form onSubmit={handleSubmit} >
        <input
          className="input"
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
         
        />

        <input
          className="input"
          type="date"
          value={tripDate}
          onChange={(e) => setTripDate(e.target.value)}
          
        />

        <input
          className="input"
          type="text"
          placeholder="Attach to activity (example: Beach Visit)"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          
        />

        <textarea
          className="input"
          rows="6"
          placeholder="Write your journal entry here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          
        />

        <button className="btn" type="submit">
          {editingId ? "Update Entry" : "Save Entry"}
        </button>

        {editingId && (
          <button className="btn btn-light" type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      <label><strong>Filter by Date: </strong></label>
      <input
        className="input"
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
          
      />
      <button className="btn btn-light" onClick={() => setFilterDate("")}>
        Clear Filter
      </button>
      
      <h3>Trip Journal Entries</h3>
      {entries.length === 0 ? (
        <p>No journal entries found.</p>
      ) : (
        entries.map((entry) => (
          <div key={entry._id} className="card entry">
            <h4>{entry.title}</h4>
            <p><strong>Saved Date:</strong> {entry.entryDate}</p>
            {entry.tripDate && <p><strong>Trip Date:</strong> {entry.tripDate}</p>}
            {entry.activity && <p><strong>Activity:</strong> {entry.activity}</p>}
            <p>{entry.content}</p>

            <button className="btn" onClick={() => startEdit(entry)}>
              Edit
            </button>
            <button className="btn btn-light" onClick={() => deleteEntry(entry._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);
}

export default TripjournalUI;