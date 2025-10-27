# MapTheWalls

MapTheWalls is a React-powered graffiti tracker that lets users map and catalog street art directly from their photos.  
Each submission automatically uses GPS data from the image (or your current location) to drop a pin on the map — creating a living map of urban art around the world.

---

## Features

- Interactive map built with React-Leaflet and OpenStreetMap tiles  
- Smart photo uploads with HEIC to JPEG conversion, adaptive compression, and live preview  
- Automatic location detection using EXIF GPS metadata or browser geolocation  
- Offline storage via browser localStorage  
- Gallery view with image thumbnails and metadata  
- “Open in Map” action that jumps to the graffiti’s exact location  
- Smooth fly-to animation and brief highlight around focused markers

---

## Built With

- React + TypeScript (Vite)  
- Tailwind CSS  
- React-Leaflet  
- exifr (for GPS metadata extraction)  
- LocalStorage for offline persistence

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

Then visit http://localhost:5173/ in your browser.

```

Roadmap
	•	User-generated ratings and comments
	•	Cloud upload (Rails or Node backend with Cloudinary)
	•	Map filters by area, artist, or style
	•	Mobile offline mode
	•	Clustered thumbnails for dense graffiti areas

⸻

Concept

Every photo tells a story; every wall is a canvas.
MapTheWalls makes street art discoverable by mapping creativity in real space and time.

⸻

Created by Paul Miyamoto

Built in Tokyo with React, TypeScript, Tailwind, and curiosity.
