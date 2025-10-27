// src/routes/SpotDetail.tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraffitiSpot } from "../types";
import { loadSpots } from "../lib/storage";
import NavBar from "../components/NavBar";

// Mini map
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: marker1x,
  iconRetinaUrl: marker2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/** ---------------------------------------------
 * Simple Lightbox with zoom (+/–), wheel zoom,
 * ESC/backdrop close, and drag-to-pan.
 * --------------------------------------------*/
function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1); // 1 = fit
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Constrain offset so image never disappears completely
  function clampOffset(nx: number, ny: number) {
    // Allow generous panning; no strict bounds needed for simplicity
    return { x: nx, y: ny };
  }

  function zoomTo(next: number, centerX?: number, centerY?: number) {
    const min = 1;
    const max = 4;
    const newScale = Math.min(max, Math.max(min, next));

    // Optional: zoom toward pointer (simple approximation)
    if (centerX != null && centerY != null && newScale !== scale) {
      const dx = centerX - window.innerWidth / 2;
      const dy = centerY - window.innerHeight / 2;
      const factor = newScale / scale - 1;
      const nx = offset.x - dx * factor;
      const ny = offset.y - dy * factor;
      setOffset(clampOffset(nx, ny));
    }

    setScale(newScale);
    if (newScale === 1) setOffset({ x: 0, y: 0 });
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const rect = e.currentTarget.getBoundingClientRect();
    zoomTo(scale + delta, e.clientX - rect.left, e.clientY - rect.top);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (scale === 1) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => clampOffset(o.x + dx, o.y + dy));
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[30000] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      onWheel={onWheel}
    >
      {/* Close X (optional) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-9 px-3 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-zinc-100 hover:bg-zinc-800"
      >
        Close
      </button>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomTo(scale - 0.25);
          }}
          className="h-10 w-10 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-zinc-100 text-xl hover:bg-zinc-800"
        >
          –
        </button>
        <div className="px-3 py-2 rounded-lg bg-zinc-900/70 border border-zinc-700/60 text-zinc-200 text-sm">
          {Math.round(scale * 100)}%
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomTo(scale + 0.25);
          }}
          className="h-10 w-10 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-zinc-100 text-xl hover:bg-zinc-800"
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomTo(1);
          }}
          className="h-10 px-3 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-zinc-100 text-sm hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>

      {/* Image stage (click inside should not close) */}
      <div
        className="max-h-[90vh] max-w-[92vw] overflow-hidden rounded-xl border border-zinc-800 bg-black/60 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <img
          src={src}
          alt={alt}
          className="select-none"
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            maxHeight: "90vh",
            maxWidth: "92vw",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

export default function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<GraffitiSpot | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const all = loadSpots();
    setSpot(all.find((s) => s.id === id) ?? null);
  }, [id]);

  const center = useMemo<[number, number] | null>(() => {
    if (!spot) return null;
    return [spot.lat, spot.lng];
  }, [spot]);

  if (!spot) {
    return (
      <main className="min-h-screen bg-black text-zinc-100 p-6">
        <div className="mb-4">
          <Link to="/gallery" className="text-sm underline text-zinc-300 hover:text-zinc-100">
            ← Back to gallery
          </Link>
        </div>
        <div className="text-sm text-zinc-400">Spot not found.</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <NavBar />

      {/* Content container */}
      <main className="max-w-5xl mx-auto px-4 pt-16 pb-10">
        {/* Top actions */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link
              to="/gallery"
              className="text-sm underline text-zinc-300 hover:text-zinc-100"
            >
              ← Back to gallery
            </Link>
            <button
              onClick={() => navigate("/")}
              className="text-sm underline text-zinc-300 hover:text-zinc-100"
            >
              ← Back to map
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/?focus=${spot.id}`)}
              className="rounded-lg px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
            >
              Open in map
            </button>
          </div>
        </div>

        {/* Photo — click to open Lightbox */}
        <section className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60">
          {spot.photoUrl ? (
            <button
              className="w-full max-h-[80vh] bg-black flex items-center justify-center cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open image"
            >
              <img
                src={spot.photoUrl}
                alt={spot.title}
                className="max-h-[80vh] w-auto h-auto object-contain"
                draggable={false}
              />
            </button>
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-sm text-zinc-500">
              No photo
            </div>
          )}
        </section>

        {/* Meta + actions */}
        <section className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium">{spot.title || "Untitled"}</h1>
            <div className="text-xs text-zinc-400">
              Added {new Date(spot.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Placeholder actions */}
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
              onClick={() => alert("Rating coming soon")}
            >
              ★ Rate
            </button>
            <button
              className="rounded-lg px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
              onClick={() =>
                navigator.share?.({ title: spot.title, url: location.href }) ||
                alert("Use your browser to share this URL.")
              }
            >
              Share
            </button>
          </div>
        </section>

        {/* Description */}
        {spot.description && (
          <section className="mt-4">
            <h2 className="text-sm text-zinc-400 mb-1">Notes</h2>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{spot.description}</p>
          </section>
        )}

        {/* Mini map */}
        <section className="mt-6">
          <h2 className="text-sm text-zinc-400 mb-2">Location</h2>
          <div className="h-64 w-full rounded-2xl overflow-hidden border border-zinc-800">
            {center && (
              <MapContainer
                center={center}
                zoom={16}
                className="h-full w-full"
                scrollWheelZoom={false}
                dragging={true}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} />
              </MapContainer>
            )}
          </div>
        </section>
      </main>

      {lightboxOpen && spot.photoUrl && (
        <Lightbox src={spot.photoUrl} alt={spot.title} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
