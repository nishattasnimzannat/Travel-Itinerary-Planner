import { useEffect, useState } from "react";

function TripTimelineUI() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");

  const [items, setItems] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // LOAD TRIPS
  useEffect(() => {
    fetch("http://localhost:3000/api/trips")
      .then(res => res.json())
      .then(data => setTrips(data));
  }, []);

  // LOAD SELECTED TRIP SCHEDULE
  useEffect(() => {
    if (!selectedTripId) return;

    fetch(`http://localhost:3000/api/schedule/${selectedTripId}`)
      .then(res => res.json())
      .then(data => setItems(data));
  }, [selectedTripId]);

  // LOAD ALL SCHEDULES (GLOBAL)
  const loadAllSchedules = async () => {
    const res = await fetch("http://localhost:3000/api/schedule");
    const data = await res.json();
    setAllSchedules(data);
  };

  useEffect(() => {
    loadAllSchedules();
  }, []);

  // AUTO HIDE MESSAGE
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTripId) {
      setMessage("Select a trip first!");
      return;
    }

    if (!title || !date || !startTime || !endTime) {
      setMessage("Fill all required fields!");
      return;
    }

    // OVERLAP CHECK
    const isOverlapping = items.some(item =>
      item._id !== editingId &&
      item.date === date &&
      (
        (startTime >= item.startTime && startTime < item.endTime) ||
        (endTime > item.startTime && endTime <= item.endTime) ||
        (startTime <= item.startTime && endTime >= item.endTime)
      )
    );

    if (isOverlapping) {
      setMessage("⚠️ Time overlaps with another activity!");
      return;
    }

    const url = editingId
      ? `http://localhost:3000/api/schedule/${editingId}`
      : "http://localhost:3000/api/schedule";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: selectedTripId,
        title,
        date,
        startTime,
        endTime,
        location,
        description
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message);
      return;
    }

    setMessage(editingId ? "Activity updated!" : "Activity added!");
    setEditingId(null);

    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setDescription("");

    // REFRESH BOTH VIEWS
    const updated = await fetch(`http://localhost:3000/api/schedule/${selectedTripId}`);
    setItems(await updated.json());
    await loadAllSchedules();
  };

  // EDIT
  const handleEdit = (item) => {
    setEditingId(item._id);
    setTitle(item.title);
    setDate(item.date);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setLocation(item.location || "");
    setDescription(item.description || "");
  };

  // TOGGLE STATUS
  const toggleStatus = async (id) => {
    await fetch(`http://localhost:3000/api/schedule/${id}/status`, {
      method: "PATCH"
    });

    const updated = await fetch(`http://localhost:3000/api/schedule/${selectedTripId}`);
    setItems(await updated.json());
    await loadAllSchedules();
  };

  // DELETE
  const deleteItem = async (id) => {
    await fetch(`http://localhost:3000/api/schedule/${id}`, {
      method: "DELETE"
    });

    const updated = await fetch(`http://localhost:3000/api/schedule/${selectedTripId}`);
    setItems(await updated.json());
    await loadAllSchedules();
  };

  // SORT GLOBAL SCHEDULE
  const sortedSchedules = [...allSchedules].sort((a, b) => {
    return new Date(a.date + " " + a.startTime) - new Date(b.date + " " + b.startTime);
  });

  return (
    <div className="container">

      {/* FORM */}
      <div className="card">
        <h2>Trip Timeline / Schedule</h2>

        <select
          className="input"
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
        >
          <option value="">-- Select Trip --</option>
          {trips.map(t => (
            <option key={t._id} value={t._id}>
              {t.title}
            </option>
          ))}
        </select>

        <form onSubmit={handleSubmit}>
          <input className="input" placeholder="Activity Title"
            value={title} onChange={e => setTitle(e.target.value)} />

          <input className="input" type="date"
            value={date} onChange={e => setDate(e.target.value)} />

          <label>Start Time</label>
          <input className="input" type="time"
            value={startTime} onChange={e => setStartTime(e.target.value)} />

          <label>End Time</label>
          <input className="input" type="time"
            value={endTime} onChange={e => setEndTime(e.target.value)} />

          <input className="input" placeholder="Location"
            value={location} onChange={e => setLocation(e.target.value)} />

          <textarea className="input" placeholder="Description"
            value={description} onChange={e => setDescription(e.target.value)} />

          <button className="btn">
            {editingId ? "Update Activity" : "Add Activity"}
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>

      {/* SELECTED TRIP SCHEDULE */}
      <div className="card">
        <h3>Selected Trip Schedule</h3>

        {items.length === 0 ? (
          <p>No activities yet</p>
        ) : (
          items.map(item => (
            <div className="card entry" key={item._id}>
              <h4>{item.title}</h4>
              <p><strong>Date:</strong> {item.date}</p>
              <p><strong>Time:</strong> {item.startTime} → {item.endTime}</p>
              <p><strong>Status:</strong> {item.status}</p>

              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => toggleStatus(item._id)}>Toggle</button>
              <button onClick={() => deleteItem(item._id)}>Delete</button>
            </div>
          ))
        )}
      </div>

      {/* GLOBAL SCHEDULE */}
      <div className="card">
        <h3>🌍 All Trips Schedule</h3>

        {sortedSchedules.length === 0 ? (
          <p>No schedules available</p>
        ) : (
          sortedSchedules.map(item => (
            <div className="card entry" key={item._id}>
              <h4>{item.title}</h4>

              <p><strong>Trip:</strong> {item.tripTitle || item.tripId}</p>
              <p><strong>Date:</strong> {item.date}</p>
              <p><strong>Time:</strong> {item.startTime} → {item.endTime}</p>
              <p><strong>Status:</strong> {item.status}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default TripTimelineUI;