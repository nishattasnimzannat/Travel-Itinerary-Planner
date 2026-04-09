import { useEffect, useState } from "react";

function App() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [packingItems, setPackingItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchTrips = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/trips");
      const data = await res.json();
      setTrips(data);

      if (data.length > 0 && !selectedTripId) {
        setSelectedTripId(data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch trips");
    }
  };

  const fetchPackingItems = async (tripId) => {
    if (!tripId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/packing/${tripId}`);
      const data = await res.json();
      setPackingItems(data);
    } catch (error) {
      console.error("Failed to fetch packing items");
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchPackingItems(selectedTripId);
    }
  }, [selectedTripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!itemName || !category) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      if (editingId) {
        await fetch(`http://localhost:3000/api/packing/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemName, category }),
        });
        setMessage("Item updated");
      } else {
        const res = await fetch("http://localhost:3000/api/packing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId: selectedTripId,
            itemName,
            category,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to add item");
          return;
        }

        setMessage("Item added");
      }

      setItemName("");
      setCategory("");
      setEditingId(null);
      fetchPackingItems(selectedTripId);
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const togglePacked = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/packing/${id}/toggle`, {
        method: "PATCH",
      });
      fetchPackingItems(selectedTripId);
    } catch (error) {
      console.error("Failed to toggle packed status");
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/packing/${id}`, {
        method: "DELETE",
      });
      fetchPackingItems(selectedTripId);
    } catch (error) {
      console.error("Failed to delete item");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setItemName(item.itemName);
    setCategory(item.category);
    setMessage("");
  };

  const packedCount = packingItems.filter((item) => item.packed).length;
  const totalCount = packingItems.length;

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Packing Checklist Builder</h1>

      <div style={{ marginBottom: "20px" }}>
        <label><strong>Select Trip: </strong></label>
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          style={{ padding: "8px", marginLeft: "10px" }}
        >
          {trips.map((trip) => (
            <option key={trip._id} value={trip._id}>
              {trip.title} - {trip.destination}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="">Select category</option>
          <option value="Clothes">Clothes</option>
          <option value="Electronics">Electronics</option>
          <option value="Documents">Documents</option>
          <option value="Toiletries">Toiletries</option>
        </select>

        <button type="submit">
          {editingId ? "Update Item" : "Add Item"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <h3>
        Progress: {packedCount} / {totalCount} packed
      </h3>

      {packingItems.length === 0 ? (
        <p>No packing items yet.</p>
      ) : (
        packingItems.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h4 style={{ margin: 0 }}>{item.itemName}</h4>
              <p style={{ margin: "5px 0" }}>Category: {item.category}</p>
              <p style={{ margin: "5px 0" }}>
                Status: {item.packed ? "Packed" : "Unpacked"}
              </p>
            </div>

            <div>
              <button onClick={() => togglePacked(item._id)} style={{ marginRight: "8px" }}>
                {item.packed ? "Mark Unpacked" : "Mark Packed"}
              </button>

              <button onClick={() => startEdit(item)} style={{ marginRight: "8px" }}>
                Edit
              </button>

              <button onClick={() => deleteItem(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;