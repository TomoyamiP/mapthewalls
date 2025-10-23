// src/components/MapView.tsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { GraffitiSpot } from "../types";

// Fix default marker icons in Vite
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

export default function MapView({ spots = [] as GraffitiSpot[] }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const userMarker = useMemo(() => (userPos ? [userPos] : []), [userPos]);

  return (
    <MapContainer center={TOKYO_STATION} zoom={13} className="h-screen w-screen" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UseLocate onLocate={setUserPos} />

      {/* Saved graffiti markers */}
      {spots.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]}>
          <Popup maxWidth={260}>
            <div className="text-sm">
              <div className="font-medium mb-2">{s.title}</div>
              {s.photoUrl ? (
                <img
                  src={s.photoUrl}
                  alt={s.title}
                  className="block"
                  style={{
                    display: "block",
                    width: 220,
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <div className="text-xs text-gray-500">No photo</div>
              )}
              <div className="mt-2 text-xs opacity-70">
                {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Optional: your current position */}
      {userMarker.map((pos, i) => (
        <Marker key={`u-${i}`} position={pos} />
      ))}
    </MapContainer>
  );
}
