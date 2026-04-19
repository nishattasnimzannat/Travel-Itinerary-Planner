import { useState } from "react";
import WeatherForecast from "./components/WeatherForecast.jsx";
import ExportPDF from "./components/ExportPDF.jsx";
import MapViewFeature from "./components/MapViewFeature.jsx";
import TravelDocumentsVault from "./components/TravelDocumentsVault.jsx";
import TripMemoryGallery from "./components/TripMemoryGallery.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("weather");
  const tabTitleMap = {
    weather: "Weather Forecast",
    map: "Map View of Activity Locations",
    pdf: "Export and Share PDF",
    vault: "Travel Documents Vault",
    gallery: "Trip Completion and Memory Gallery",
  };

  return (
    <div className="page">
      <h1>{tabTitleMap[activeTab]}</h1>
      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "weather" ? "active" : ""}`}
          onClick={() => setActiveTab("weather")}
        >
          Weather Forecast
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          Activity Map
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "pdf" ? "active" : ""}`}
          onClick={() => setActiveTab("pdf")}
        >
          Export and Share PDF
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "vault" ? "active" : ""}`}
          onClick={() => setActiveTab("vault")}
        >
          Documents Vault
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "gallery" ? "active" : ""}`}
          onClick={() => setActiveTab("gallery")}
        >
          Memory Gallery
        </button>
      </div>

      {activeTab === "weather" && <WeatherForecast />}
      {activeTab === "map" && <MapViewFeature />}
      {activeTab === "pdf" && <ExportPDF />}
      {activeTab === "vault" && <TravelDocumentsVault />}
      {activeTab === "gallery" && <TripMemoryGallery />}
    </div>
  );
}
