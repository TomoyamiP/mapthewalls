// src/routes/SpotDetail.tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

export default function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<GraffitiSpot | null>(null);

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

        {/* Photo */}
        <section className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60">
          {spot.photoUrl ? (
            <img
              src={spot.photoUrl}
              alt={spot.title}
              className="w-full h-auto object-cover max-h-[70vh]"
            />
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
    </div>
  );
}
