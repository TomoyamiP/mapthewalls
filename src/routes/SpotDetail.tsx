// src/routes/SpotDetail.tsx
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { GraffitiSpot } from "../types";
import { loadSpots } from "../lib/storage";

// Mini map bits
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
        <header className="mb-4 flex items-center justify-between">
          <Link to="/gallery" className="text-sm underline text-zinc-300 hover:text-zinc-100">
            ← Back to gallery
          </Link>
        </header>
        <div className="text-sm text-zinc-400">Spot not found.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <header className="p-4 flex items-center justify-between">
        <Link to="/gallery" className="text-sm underline text-zinc-300 hover:text-zinc-100">
          ← Back to gallery
        </Link>
        <div className="text-sm text-zinc-400 truncate max-w-[60%]">{spot.title}</div>
      </header>

      <section className="px-4 md:px-6 pb-8 space-y-6">
        {/* Big photo */}
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
          {spot.photoUrl ? (
            <img src={spot.photoUrl} alt={spot.title} className="w-full h-auto object-cover" />
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-sm text-zinc-500">
              No photo
            </div>
          )}
        </div>

        {/* Meta + rating placeholder */}
        <div className="flex items-center gap-4">
          <button className="rounded-xl px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700">
            ★ Rate
          </button>
          <div className="text-sm text-zinc-400">
            Added {new Date(spot.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Mini map */}
        <div>
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
        </div>

        {/* Description */}
        {spot.description && (
          <div>
            <h2 className="text-sm text-zinc-400 mb-1">Notes</h2>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{spot.description}</p>
          </div>
        )}
      </section>
    </main>
  );
}
