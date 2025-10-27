// src/components/MapView.tsx
import { useEffect, useMemo, useRef, useState } from "react";
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

// Focus controller to fly to a spot when focusId changes
function FocusController({
  spots,
  focusId,
}: {
  spots: GraffitiSpot[];
  focusId?: string;
}) {
  const map = useMap();
  useEffect(() => {
    if (!focusId) return;
    const target = spots.find((s) => s.id === focusId);
    if (!target) return;
    map.flyTo([target.lat, target.lng], 17, { duration: 0.6 });
  }, [focusId, spots, map]);
  return null;
}

export default function MapView({
  spots = [] as GraffitiSpot[],
  focusId,
}: {
  spots?: GraffitiSpot[];
  focusId?: string;
}) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const userMarker = useMemo(() => (userPos ? [userPos] : []), [userPos]);

  // Ref to the currently focused marker so we can open its popup
  const focusedRef = useRef<L.Marker | null>(null);

  // Auto-open the popup when focusId changes
  useEffect(() => {
    focusedRef.current?.openPopup();
  }, [focusId, spots]);

  return (
    <MapContainer center={TOKYO_STATION} zoom={13} className="h-screen w-screen" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <UseLocate onLocate={setUserPos} />
      <FocusController spots={spots} focusId={focusId} />

      {/* Saved graffiti markers */}
      {spots.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          ref={s.id === focusId ? focusedRef : undefined}
        >
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
