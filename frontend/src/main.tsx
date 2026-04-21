import "./style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateTrip from "./pages/CreateTrip";
import TripDetail from "./pages/TripDetail";
import EditTrip from "./pages/EditTrip";
import DayItinerary from "./pages/DayItinerary";
import MyTrips from "./pages/MyTrips";
import Layout from "./components/Layout";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><CreateTrip /></Layout>} />
        <Route path="/trips" element={<Layout><MyTrips /></Layout>} />
        <Route path="/trips/:id" element={<Layout><TripDetail /></Layout>} />
        <Route path="/trips/:id/edit" element={<Layout><EditTrip /></Layout>} />
        <Route path="/trips/:id/itinerary" element={<Layout><DayItinerary /></Layout>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);