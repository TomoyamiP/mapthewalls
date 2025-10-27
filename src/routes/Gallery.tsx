// src/routes/Gallery.tsx
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { GraffitiSpot } from "../types";
import { loadSpots } from "../lib/storage";
import NavBar from "../components/NavBar";

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
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 pt-16 pb-10">
          <header className="mb-5 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Showcase</h1>
            <Link
              to="/"
              className="text-sm underline text-zinc-300 hover:text-zinc-100"
            >
              Explore map
            </Link>
          </header>

          <div className="rounded-2xl border border-zinc-700/40 bg-zinc-900/50 p-6 text-sm text-zinc-400 shadow-lg shadow-black/30">
            No spots yet. Add one from the map (spraycan button) and it’ll appear here.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        {/* Header */}
        <header className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Showcase</h1>
          <div className="text-sm text-zinc-400">{sorted.length} spots</div>
          <Link
            to="/"
            className="text-sm underline text-zinc-300 hover:text-zinc-100"
          >
            Explore map
          </Link>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sorted.map((s) => (
            <div key={s.id} className="group relative">
              {/* Card body */}
              <Link to={`/spots/${s.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-700/40 bg-zinc-900/50 shadow-lg shadow-black/30">
                  {s.photoUrl ? (
                    <img
                      src={s.photoUrl}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">
                      No photo
                    </div>
                  )}

                  {/* Hover gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Date badge (top-left) */}
                  <div className="absolute top-2 left-2 rounded-md bg-zinc-950/70 px-2 py-0.5 text-[10px] text-zinc-200 border border-zinc-700/50">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>

                  {/* Bottom text overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-2.5">
                    <div className="text-[13px] font-medium text-zinc-100 line-clamp-1">
                      {s.title || "Untitled"}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Hover “Open in Map” quick action */}
              <button
                onClick={() => navigate(`/?focus=${s.id}`)}
                className="absolute inset-0 flex items-center justify-center rounded-xl
                           bg-black/0 opacity-0 transition-opacity duration-200
                           group-hover:bg-black/50 group-hover:opacity-100"
              >
                <span className="text-sm bg-zinc-900/80 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-zinc-100 hover:bg-zinc-800 shadow-md shadow-black/30">
                  Open in Map
                </span>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
