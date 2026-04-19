# Travel Buddy (Feature 1 + Feature 3)

Framework used:
- Backend: Node.js + Express
- Frontend: React (Vite)

## Project structure

```
470 project/
  server/
    routes/
      weatherRoutes.js
      pdfRoutes.js
    .env
    package.json
    server.js
  client/
    src/
      components/
        WeatherForecast.jsx
        ExportPDF.jsx
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    vite.config.js
```

## Setup

1. Install Node.js LTS from https://nodejs.org
2. In `server/.env`, set:
   - `WEATHER_API_KEY=your_real_openweathermap_key`
3. Open two terminals in VS Code.

### Terminal 1 (backend)
```bash
cd server
npm install
npm run dev
```

### Terminal 2 (frontend)
```bash
cd client
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## Implemented features

- Feature 1: Weather forecast integration per destination and selected trip date range.
- Feature 3: Export itinerary to PDF, download PDF, and share via Web Share API / WhatsApp fallback.
