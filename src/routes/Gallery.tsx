// src/routes/Gallery.tsx
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { GraffitiSpot } from "../types";
import { loadSpots } from "../lib/storage";

export default function Gallery() {
  const [spots, setSpots] = useState<GraffitiSpot[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSpots(loadSpots());
  }, []);

  const sorted = useMemo(
    () =>
      [...spots].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [spots]
  );

  if (sorted.length === 0) {
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
        <div className="text-sm text-zinc-400">{sorted.length} spots</div>
        <Link to="/" className="text-sm underline text-zinc-300 hover:text-zinc-100">
          Explore map
        </Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sorted.map((s) => (
          <div key={s.id} className="group relative">
            <Link to={`/spots/${s.id}`}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                {s.photoUrl ? (
                  <img
                    src={s.photoUrl}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">
                    No photo
                  </div>
                )}

                {/* Date badge (top-left) */}
                <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-zinc-200 border border-zinc-700/60">
                  {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>

            {/* Hover “Open in Map” button */}
            <button
              onClick={() => navigate(`/?focus=${s.id}`)}
              className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 group-hover:bg-black/60 group-hover:opacity-100 transition"
            >
              <span className="text-sm bg-zinc-900/80 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 hover:bg-zinc-800">
                Open in Map
              </span>
            </button>

            <div className="mt-2 text-xs text-zinc-300 group-hover:text-zinc-100 line-clamp-1">
              {s.title || "Untitled"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
