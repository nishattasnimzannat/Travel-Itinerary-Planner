import { useEffect, useState } from "react";

function PackingChecklistUI() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [packingItems, setPackingItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // ================= FETCH TRIPS =================
  const fetchTrips = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/trips");
      const data = await res.json();
      setTrips(data);
    } catch (error) {
      console.error("Failed to fetch trips");
    }
  };

  // ================= FETCH ITEMS =================
  const fetchPackingItems = async (tripId) => {
    if (!tripId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/packing/${tripId}`);
      const data = await res.json();
      console.log("Fetched items:", data); // DEBUG
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

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedTripId || !itemName || !category) {
      setMessage("Please select a trip and fill all fields");
      return;
    }

    try {
      if (editingId) {
        // ✅ FIXED UPDATE
        const res = await fetch(`http://localhost:3000/api/packing/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemName, category }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Update failed");
          return;
        }

        setMessage("Item updated");
      } else {
        // ADD ITEM
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

      // RESET
      setItemName("");
      setCategory("");
      setEditingId(null);

      // REFRESH DATA
      fetchPackingItems(selectedTripId);

    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  // ================= TOGGLE =================
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

  // ================= DELETE =================
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

  // ================= EDIT =================
  const startEdit = (item) => {
    setEditingId(item._id);
    setItemName(item.itemName);
    setCategory(item.category);
    setMessage("");
  };

  const packedCount = packingItems.filter((item) => item.packed).length;
  const totalCount = packingItems.length;

  // ================= UI =================
  return (
    <div className="container">
      <div className="card">

        <h1 className="title">Packing Checklist Builder</h1>

        {/* SELECT TRIP */}
        <label><strong>Select Trip:</strong></label>
        <select
          className="input"
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
        >
          <option value="">-- Select Trip --</option>
          {trips.map((trip) => (
            <option key={trip._id} value={trip._id}>
              {trip.title} - {trip.destination}
            </option>
          ))}
        </select>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />

          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="Clothes">Clothes</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Toiletries">Toiletries</option>
          </select>

          <button className="btn" type="submit">
            {editingId ? "Update Item" : "Add Item"}
          </button>
        </form>

        {/* MESSAGE */}
        {message && <div className="card">{message}</div>}

        {/* SHOW ONLY IF TRIP SELECTED */}
        {!selectedTripId && (
          <div className="card">
            <p>Please select a trip first.</p>
          </div>
        )}

        {selectedTripId && (
          <>
            <h3>
              Progress: {packedCount} / {totalCount} packed
            </h3>

            {packingItems.length === 0 ? (
              <div className="card">
                <p>No packing items yet.</p>
              </div>
            ) : (
              packingItems.map((item) => (
                <div key={item._id} className="card">
                  <h4>{item.itemName}</h4>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {item.packed ? "Packed" : "Unpacked"}
                  </p>

                  <button className="btn" onClick={() => togglePacked(item._id)}>
                    {item.packed ? "Mark Unpacked" : "Mark Packed"}
                  </button>

                  <button className="btn" onClick={() => startEdit(item)}>
                    Edit
                  </button>

                  <button className="btn" onClick={() => deleteItem(item._id)}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default PackingChecklistUI;