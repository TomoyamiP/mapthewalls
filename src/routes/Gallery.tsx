// src/routes/Gallery.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { GraffitiSpot } from "../types";
import { loadSpots } from "../lib/storage";

export default function Gallery() {
  const [spots, setSpots] = useState<GraffitiSpot[]>([]);
  const [sortKey, setSortKey] = useState<"nearest" | "newest" | "rating_desc" | "rating_asc">("newest");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSpots(loadSpots());
  }, []);

  // If user selects "Nearest", request geolocation once
  useEffect(() => {
    if (sortKey !== "nearest" || userLoc) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => void 0,
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
      );
    }
  }, [sortKey, userLoc]);

  // Tiny, global Haversine helper (meters)
  const haversineMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };

  const sorted = useMemo(() => {
    const list = [...spots];

    const getCreatedAt = (s: any) =>
      typeof s?.createdAt === "number"
        ? s.createdAt
        : s?.createdAt
        ? Date.parse(s.createdAt)
        : 0;

    // Use your schema: average = ratingSum / ratingCount (fallback 0)
    const getRating = (s: any): number => {
      const sum = Number(s?.ratingSum ?? 0);
      const cnt = Number(s?.ratingCount ?? 0);
      return cnt > 0 && isFinite(sum) && isFinite(cnt) ? sum / cnt : 0;
    };

    switch (sortKey) {
      case "newest":
        return list.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));

      case "rating_desc": // Highest ranked first
        return list.sort(
          (a, b) =>
            getRating(b) - getRating(a) ||
            // tie-breakers: more votes first, then newest
            (Number(b?.ratingCount ?? 0) - Number(a?.ratingCount ?? 0)) ||
            getCreatedAt(b) - getCreatedAt(a)
        );

      case "rating_asc": // Lowest ranked first
        return list.sort(
          (a, b) =>
            getRating(a) - getRating(b) ||
            (Number(a?.ratingCount ?? 0) - Number(b?.ratingCount ?? 0)) ||
            getCreatedAt(b) - getCreatedAt(a)
        );

      case "nearest":
        if (!userLoc) return list;
        return list.sort(
          (a: any, b: any) =>
            haversineMeters(userLoc, { lat: a.lat, lng: a.lng }) -
              haversineMeters(userLoc, { lat: b.lat, lng: b.lng }) ||
            getCreatedAt(b) - getCreatedAt(a)
        );

      default:
        return list;
    }
  }, [spots, sortKey, userLoc]);

  if (sorted.length === 0) {
    return (
      <main className="min-h-screen bg-black text-zinc-100 p-6 pt-20">
        <header className="mb-4 flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            No spots yet. Add one from the map (+) and it’ll appear here.
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-6 pt-20">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Sort selector */}
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="gallery-sort" className="text-zinc-400">
            Sort by
          </label>
          <select
            id="gallery-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="rounded-lg bg-zinc-900/70 text-zinc-100 border border-zinc-700 px-3 py-1.5 outline-none focus:border-zinc-500"
          >
            <option value="nearest">Nearest to me</option>
            <option value="newest">Newest</option>
            <option value="rating_desc">Highest ranked</option>
            <option value="rating_asc">Lowest ranked</option>
          </select>
        </div>

        <div className="text-sm text-zinc-400">{sorted.length} spots</div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sorted.map((s) => (
          <div key={s.id} className="group relative">
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

              {/* Date badge */}
              <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-zinc-200 border border-zinc-700/60">
                {new Date(s.createdAt).toLocaleDateString()}
              </div>

              {/* Hover buttons */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/0 opacity-0 group-hover:bg-black/60 group-hover:opacity-100 transition">
                <button
                  onClick={() => navigate(`/spots/${s.id}`)}
                  className="text-sm bg-zinc-900/80 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 hover:bg-zinc-800 transition"
                >
                  View details
                </button>
                <button
                  onClick={() => navigate(`/?focus=${s.id}`)}
                  className="text-sm bg-zinc-900/80 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 hover:bg-zinc-800 transition"
                >
                  Open in map
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs text-zinc-300 group-hover:text-zinc-100 line-clamp-1">
              {s.title || "Untitled"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
