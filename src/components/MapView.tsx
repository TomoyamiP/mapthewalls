// src/components/MapView.tsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Fix default marker icons in Vite (so the pin shows up) ---
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: marker1x,
  iconRetinaUrl: marker2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const TOKYO_STATION: [number, number] = [35.681236, 139.767125];

function UseLocate({ onLocate }: { onLocate: (pos: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (g) => {
        const pos: [number, number] = [g.coords.latitude, g.coords.longitude];
        map.setView(pos, 15);
        onLocate(pos);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [map, onLocate]);
  return null;
}

export default function MapView() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const markers = useMemo(() => (userPos ? [userPos] : []), [userPos]);

  return (
      <MapContainer
        center={TOKYO_STATION}
        zoom={13}
        className="h-screen w-screen"  // Tailwind: full viewport height & width
        scrollWheelZoom
      >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UseLocate onLocate={setUserPos} />
      {markers.map((pos, i) => (
        <Marker key={i} position={pos} />
      ))}
    </MapContainer>
  );
}
