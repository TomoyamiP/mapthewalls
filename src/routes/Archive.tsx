// src/routes/Archive.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { GraffitiSpot } from "../types";
// Switched to Supabase-backed loader
import { loadSpotsFromSupabase } from "../lib/spots";

type SortKey = "nearest" | "newest" | "rating_desc" | "rating_asc";

export default function Gallery() {
  const [spots, setSpots] = useState<GraffitiSpot[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  // ✅ NEW: load spots from Supabase instead of localStorage
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const supabaseSpots = await loadSpotsFromSupabase();
        if (isMounted) {
          setSpots(supabaseSpots);
        }
      } catch (error) {
        console.error("Failed to load spots from Supabase in Gallery:", error);
        // Optional: you could show a fallback UI or toast here later
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // If user selects "Nearest", request geolocation once
  useEffect(() => {
    if (sortKey !== "nearest" || userLoc) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.warn("Geolocation error:", err);
        }
      );
    }
  }, [sortKey, userLoc]);

  function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);

    const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  }

  const sortedSpots = useMemo(() => {
    const spotsCopy = [...spots];

    switch (sortKey) {
      case "newest":
        return spotsCopy.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
      case "rating_desc":
        return spotsCopy.sort((a, b) => {
          const aRating = a.avgRating ?? 0;
          const bRating = b.avgRating ?? 0;
          return bRating - aRating;
        });
      case "rating_asc":
        return spotsCopy.sort((a, b) => {
          const aRating = a.avgRating ?? 0;
          const bRating = b.avgRating ?? 0;
          return aRating - bRating;
        });
      case "nearest":
        if (!userLoc) return spotsCopy;
        return spotsCopy.sort((a, b) => {
          const aDist = distanceKm(userLoc, { lat: a.lat, lng: a.lng });
          const bDist = distanceKm(userLoc, { lat: b.lat, lng: b.lng });
          return aDist - bDist;
        });
      default:
        return spotsCopy;
    }
  }, [spots, sortKey, userLoc]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 text-zinc-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Archive</h1>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-zinc-300">
            Sort by
          </label>
          <select
            id="sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="nearest">Nearest</option>
            <option value="rating_desc">Rating (high → low)</option>
            <option value="rating_asc">Rating (low → high)</option>
          </select>
        </div>
      </div>

      {sortedSpots.length === 0 ? (
        <div className="mt-8 mb-6 min-h-[40vh] flex items-start">
          <p className="text-zinc-200 text-base leading-relaxed">
            No photos yet.
            <br />
            Add a spot from the map to see it here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedSpots.map((spot) => (
            <li
              key={spot.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/70 border border-zinc-800 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                {spot.photoUrl && (
                  <img
                    src={spot.photoUrl}
                    alt={spot.title || "Graffiti spot"}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="font-semibold text-sm">
                    {spot.title || "Untitled spot"}
                  </h2>
                  {spot.avgRating != null && (
                    <p className="text-xs text-zinc-400">
                      Rating: {spot.avgRating.toFixed(1)} ★
                    </p>
                  )}
                  {spot.createdAt && (
                    <p className="text-xs text-zinc-500">
                      {new Date(spot.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => navigate(`/spots/${spot.id}`)}
                  className="text-xs px-3 py-1 rounded-full border border-zinc-600 hover:border-zinc-300 hover:bg-zinc-800 transition"
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/?focus=${spot.id}`)}
                  className="text-xs px-3 py-1 rounded-full border border-zinc-600 hover:border-zinc-300 hover:bg-zinc-800 transition"
                >
                  Open in map
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
