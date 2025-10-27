// src/components/MapView.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { GraffitiSpot } from "../types";
import { Link } from "react-router-dom";

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

function UseLocate({
  onLocate,
  disableCenter = false,
}: {
  onLocate: (pos: [number, number]) => void;
  disableCenter?: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (g) => {
        const pos: [number, number] = [g.coords.latitude, g.coords.longitude];
        if (!disableCenter) {
          map.setView(pos, 15);
        }
        onLocate(pos);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [map, onLocate, disableCenter]);
  return null;
}

// Fly to a spot when focusId changes
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

  // Ref to open popup of the focused marker
  const focusedRef = useRef<L.Marker | null>(null);

  // Toggle a brief pulse when focusId changes
  const [showPulse, setShowPulse] = useState(false);
  useEffect(() => {
    if (!focusId) return;
    setShowPulse(true);
    const t = setTimeout(() => setShowPulse(false), 2000);
    return () => clearTimeout(t);
  }, [focusId]);

  // Auto-open popup when focus changes
  useEffect(() => {
    focusedRef.current?.openPopup();
  }, [focusId, spots]);

  return (
    <MapContainer center={TOKYO_STATION} zoom={13} className="h-screen w-screen" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Disable recentering to user if we're focusing a spot */}
      <UseLocate onLocate={setUserPos} disableCenter={!!focusId} />
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

              {/* actions */}
              <div className="mt-3">
                <Link
                  to={`/spots/${s.id}`}
                  className="inline-flex items-center rounded-lg px-2.5 py-1.5
                            text-xs font-medium bg-zinc-900 border border-zinc-700
                            text-zinc-100 hover:bg-zinc-800 transition"
                >
                  View details
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Brief pulse ring on the focused spot */}
      {showPulse && focusId && (() => {
        const target = spots.find((s) => s.id === focusId);
        if (!target) return null;
        return (
          <Marker
            position={[target.lat, target.lng]}
            // Cyan pulsing div icon
            icon={L.divIcon({
              className: "",
              html: `<div class="mtw-pulse"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })}
            interactive={false}
          />
        );
      })()}

      {/* Optional: your current position */}
      {userMarker.map((pos, i) => (
        <Marker key={`u-${i}`} position={pos} />
      ))}
    </MapContainer>
  );
}
