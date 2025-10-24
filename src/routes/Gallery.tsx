// src/routes/Gallery.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { GraffitiSpot } from "../types";
import { loadSpots } from "../lib/storage";

export default function Gallery() {
  const [spots, setSpots] = useState<GraffitiSpot[]>([]);

  useEffect(() => {
    setSpots(loadSpots());
  }, []);

  if (spots.length === 0) {
    return (
      <main className="min-h-screen bg-black text-zinc-100 p-6">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Showcase</h1>
          <Link to="/" className="text-sm underline text-zinc-300 hover:text-zinc-100">
            Explore map
          </Link>
        </header>
        <div className="text-sm text-zinc-400">
          No spots yet. Add one from the map (+) and it’ll appear here.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Showcase</h1>
        <Link to="/" className="text-sm underline text-zinc-300 hover:text-zinc-100">
          Explore map
        </Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {spots.map((s) => (
          <Link key={s.id} to={`/spots/${s.id}`} className="group">
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              {s.photoUrl ? (
                <img
                  src={s.photoUrl}
                  alt={s.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">
                  No photo
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-zinc-400 group-hover:text-zinc-200">
              {s.title}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
