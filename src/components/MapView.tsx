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

// Custom RED icon for saved graffiti spots
const RedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
        if (!disableCenter) map.setView(pos, 15);
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

/** Fit to all spots when there is no focusId */
function FitToSpots({
  spots,
  enabled,
}: {
  spots: GraffitiSpot[];
  enabled: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    if (!spots || spots.length === 0) return;

    if (spots.length === 1) {
      const s = spots[0];
      map.flyTo([s.lat, s.lng], 16, { duration: 0.5 });
      return;
    }

    const bounds = new L.LatLngBounds(
      spots.map((s) => new L.LatLng(s.lat, s.lng))
    );
    map.fitBounds(bounds, { padding: [60, 80], animate: true });
  }, [enabled, spots, map]);

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
    <MapContainer
      center={TOKYO_STATION}
      zoom={13}
      className="h-screen w-screen relative mtw-map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Disable recentering to user if focusing a spot OR if spots exist */}
      <UseLocate onLocate={setUserPos} disableCenter={!!focusId || spots.length > 0} />
      <FocusController spots={spots} focusId={focusId} />

      {/* Fit to all markers when there's no focus target */}
      <FitToSpots spots={spots} enabled={!focusId} />

      {/* Saved graffiti markers (RED icon) */}
      {spots.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          ref={s.id === focusId ? focusedRef : undefined}
          icon={RedIcon}
        >
          <Popup maxWidth={300}>
            {/* Popup content — card look */}
            <div className="min-w-[220px] max-w-[260px]">
              <div className="font-medium text-zinc-100 mb-2 leading-tight">
                {s.title}
              </div>

              {s.photoUrl ? (
                <div className="overflow-hidden rounded-lg border border-zinc-700/40 bg-black/30">
                  <img
                    src={s.photoUrl}
                    alt={s.title}
                    className="block w-full h-[140px] object-cover"
                  />
                </div>
              ) : (
                <div className="h-[80px] w-full flex items-center justify-center text-xs text-zinc-400 rounded-md border border-zinc-700/40 bg-black/20">
                  No photo
                </div>
              )}

              <div className="mt-2 text-[11px] text-zinc-400">
                {new Date(s.createdAt).toLocaleString()}
              </div>

              <div className="mt-3">
                <Link
                  to={`/spots/${s.id}`}
                  className="inline-flex items-center rounded-lg px-2.5 py-1.5
                             text-xs font-medium bg-zinc-900/80 border border-zinc-700/50
                             text-zinc-100 hover:bg-zinc-800/80 shadow-sm shadow-black/20 transition"
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

      {/* Optional: your current position (keeps default icon) */}
      {userMarker.map((pos, i) => (
        <Marker key={`u-${i}`} position={pos} />
      ))}

      {/* Top gradient overlay for navbar readability */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-transparent z-[500]" />
    </MapContainer>
  );
}
