import BookmarkUI from "./components/BookmarkUI";
import PackingChecklistUI from "./components/PackingChecklistUI";
import TripJournalUI from "./components/TripJournalUI";
import TripTimelineUI from "./components/TripTimelineUI";

function App() {
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Travel Itinerary Planner</h1>

      <BookmarkUI />
      <hr style={{ margin: "30px 0" }} />

      <PackingChecklistUI />
      <hr style={{ margin: "30px 0" }} />

      <TripJournalUI />
      <hr style={{ margin: "30px 0" }} />

      <TripTimelineUI />
    </div>
  );
}

export default App;