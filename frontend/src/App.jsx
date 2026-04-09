import BookmarkUI from "./components/BookmarkUI";
import PackingChecklistUI from "./components/PackingChecklistUI";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Travel Itinerary Planner</h1>

      <BookmarkUI />
      <hr />
      <PackingChecklistUI />
    </div>
  );
}

export default App;