// src/components/MapView.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { GraffitiSpot } from "../types";
import { Link } from "react-router-dom";
import MarkerClusterGroup from "react-leaflet-cluster";

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

/** Floating "Recenter to me" control */
function RecenterButton({
  userPos,
  onSetUserPos,
}: {
  userPos: [number, number] | null;
  onSetUserPos: (pos: [number, number]) => void;
}) {
  const map = useMap();

  useEffect(() => {
    function onFound(e: any) {
      const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
      onSetUserPos(pos);
      map.flyTo(pos, 15, { duration: 0.5 });
    }

    function onError(e: any) {
      console.warn("Geolocation error:", e);
      alert(
        "Couldn’t get your location. Please allow Location access in your browser settings."
      );
    }

    map.on("locationfound", onFound);
    map.on("locationerror", onError);

    return () => {
      map.off("locationfound", onFound);
      map.off("locationerror", onError);
    };
  }, [map, onSetUserPos]);

  function handleClick() {
    if (userPos) {
      map.flyTo(userPos, 15, { duration: 0.5 });
      return;
    }

    // Triggers browser permission prompt on HTTPS (Netlify) and works well on mobile
    map.locate({ enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 });
  }

  return (
    <div className="pointer-events-none absolute left-6 bottom-20 translate-y-7 z-[10000]">
      <button
        type="button"
        onClick={handleClick}
        className="pointer-events-auto cursor-pointer select-none
                   flex items-center gap-2 rounded-full px-3.5 py-2
                   bg-zinc-900/90 hover:bg-zinc-800
                   border border-zinc-700/60 shadow-xl transition active:scale-95
                   text-sm text-zinc-100"
        aria-label="Recenter to my location"
        title="Recenter to my location"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M12 6a6 6 0 100 12 6 6 0 000-12z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        Me
      </button>
    </div>
  );
}

/** Custom dark cluster icon (with inner badge we can scale on hover) */
function createDarkClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 32 : count < 100 ? 40 : 48;
  const color = "rgba(20,20,20,0.9)";
  const border = "rgba(255,255,255,0.15)";
  const text = "#f4f4f4";

  return L.divIcon({
    html: `
      <div class="mtw-cluster-badge" style="
        width:${size}px;
        height:${size}px;
        line-height:${size}px;
        border-radius:50%;
        background:${color};
        color:${text};
        border:1px solid ${border};
        font-size:13px;
        text-align:center;
        box-shadow:0 0 6px rgba(0,0,0,0.4);
      ">
        ${count}
      </div>
    `,
    className: "mtw-cluster-icon",
    iconSize: [size, size],
  });
}

export default function MapView({
  spots = [] as GraffitiSpot[],
  focusId,
  dimControls = false,
  hideControls = false,
}: {
  spots?: GraffitiSpot[];
  focusId?: string;
  dimControls?: boolean;
  hideControls?: boolean;
}) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const userMarker = useMemo(() => (userPos ? [userPos] : []), [userPos]);

  const focusedRef = useRef<L.Marker | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (!focusId) return;
    setShowPulse(true);
    const t = setTimeout(() => setShowPulse(false), 2000);
    return () => clearTimeout(t);
  }, [focusId]);

  useEffect(() => {
    focusedRef.current?.openPopup();
  }, [focusId, spots]);

  return (
    <MapContainer
      center={TOKYO_STATION}
      zoom={13}
      // ✅ iPhone fix: use the SAME top offset you used for Archive (NavBar + safe area)
      className="h-[100dvh] w-screen relative mtw-map bg-zinc-950"
      scrollWheelZoom
    >
      {/* Hover effects: subtle glow on pins; glow+scale on clusters */}
      <style>{`
        /* ✅ If anything ever shows outside tiles, make it black (kills white bands) */
        .leaflet-container { background: #09090b; } /* zinc-950 */

        .leaflet-control-zoom { margin-top: 1.5rem !important; }

        /* Pins: vibrant purple glow on hover */
        .leaflet-marker-icon {
          transition: filter 180ms ease;
        }
        .leaflet-marker-icon:hover {
          filter:
            drop-shadow(0 0 3px rgba(170, 90, 255, 0.9))
            drop-shadow(0 0 8px rgba(150, 70, 255, 0.7))
            drop-shadow(0 0 14px rgba(120, 50, 255, 0.55));
        }

        /* Clusters: larger scale + subtle purple aura */
        .mtw-cluster-icon .mtw-cluster-badge {
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .mtw-cluster-icon:hover .mtw-cluster-badge {
          transform: scale(1.15);
          box-shadow:
            0 0 10px rgba(180, 100, 255, 0.5),
            0 0 20px rgba(160, 80, 255, 0.35);
        }
      `}</style>

      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <UseLocate
        onLocate={setUserPos}
        disableCenter={!!focusId || spots.length > 0}
      />
      <FocusController spots={spots} focusId={focusId} />
      <FitToSpots spots={spots} enabled={!focusId} />

      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        maxClusterRadius={60}
        iconCreateFunction={createDarkClusterIcon}
      >
        {spots.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            ref={s.id === focusId ? focusedRef : undefined}
            icon={RedIcon}
          >
            <Popup maxWidth={300}>
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
      </MarkerClusterGroup>

      {showPulse &&
        focusId &&
        (() => {
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

      {userMarker.map((pos, i) => (
        <Marker key={`u-${i}`} position={pos} />
      ))}

      <div
        className={`transition-opacity duration-200 ${
          dimControls || hideControls ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <RecenterButton userPos={userPos} onSetUserPos={setUserPos} />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-transparent z-[500]" />
    </MapContainer>
  );
}
