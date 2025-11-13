// src/routes/SpotDetail.tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraffitiSpot } from "../types";
import {
  getAverageRating,
  getLocalVote,
  loadSpots,
  rateSpot,
  saveSpots,
} from "../lib/storage";
import NavBar from "../components/NavBar";

// UI pieces
import StarRating from "../components/StarRating";
import RatingSummary from "../components/RatingSummary";
import VerdictButtons from "../components/VerdictButtons";
import VerdictTally from "../components/VerdictTally";

// Mini map
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Supabase admin delete helper
import { deleteFromSupabase } from "../lib/upload";

// Default (blue) Leaflet pin — keep as global default in this file
const DefaultIcon = L.icon({
  iconUrl: marker1x,
  iconRetinaUrl: marker2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// NEW: Red pin to match Explore map
const RedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/** Lightbox (same as before) */
function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function zoomTo(next: number, cx?: number, cy?: number) {
    const min = 1;
    const max = 4;
    const newScale = Math.min(max, Math.max(min, next));

    if (cx != null && cy != null && newScale !== scale) {
      const dx = cx - window.innerWidth / 2;
      const dy = cy - window.innerHeight / 2;
      const factor = newScale / scale - 1;
      setOffset((o) => ({ x: o.x - dx * factor, y: o.y - dy * factor }));
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
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-9 px-3 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-zinc-100 hover:bg-zinc-800"
      >
        Close
      </button>

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

  const isAdmin =
    typeof window !== "undefined" && localStorage.getItem("admin") === "true";

  // Admin inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // For showing the user's own rating on the stars
  const userRated = useMemo(
    () => (spot ? getLocalVote(spot.id).rated ?? null : null),
    [spot]
  );

  useEffect(() => {
    const all = loadSpots();
    setSpot(all.find((s) => s.id === id) ?? null);
  }, [id]);

  const center = useMemo<[number, number] | null>(() => {
    if (!spot) return null;
    return [spot.lat, spot.lng];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot]);

  const avg = useMemo(() => (spot ? getAverageRating(spot) : null), [spot]);

  // Robust vote count fallback
  const voteCount = useMemo(() => {
    if (!spot) return 0;
    if (typeof (spot as any).ratingCount === "number")
      return (spot as any).ratingCount;
    const r = (spot as any).ratings;
    return Array.isArray(r) ? r.length : 0;
  }, [spot]);

  async function handleAdminDelete() {
    if (!spot) return;

    const ok = confirm("Delete this photo and remove this spot?");
    if (!ok) return;

    try {
      // 1) Try to delete the image from Supabase (if we have a path)
      if (spot.photoPath) {
        try {
          await deleteFromSupabase(spot.photoPath);
        } catch (err) {
          console.warn("Supabase delete failed (continuing anyway):", err);
        }
      }

      // 2) Remove the spot from the real spots list (KEY = 'graffitiSpots')
      const all = loadSpots();
      const filtered = all.filter((s) => s.id !== spot.id);
      saveSpots(filtered);

      // 3) Navigate back to gallery
      navigate("/gallery");
    } catch (err) {
      console.error(err);
      alert("Could not delete spot.");
    }
  }

  function handleAdminStartEdit() {
    if (!spot) return;
    setEditTitle(spot.title || "");
    setEditDesc(spot.description || "");
    setIsEditing(true);
  }

  function handleAdminCancelEdit() {
    setIsEditing(false);
  }

  function handleAdminSaveEdit() {
    if (!spot) return;

    const nextTitle = editTitle.trim();
    const nextDesc = editDesc.trim();

    if (!nextTitle) {
      alert("Title cannot be empty.");
      return;
    }

    const all = loadSpots();
    const idx = all.findIndex((s) => s.id === spot.id);
    if (idx < 0) return;

    const updated: GraffitiSpot = {
      ...all[idx],
      title: nextTitle,
      description: nextDesc || undefined,
    };

    all[idx] = updated;
    saveSpots(all);
    setSpot(updated);
    setIsEditing(false);
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 pt-16 pb-10">
          <div className="rounded-2xl border border-zinc-700/40 bg-zinc-900/50 p-6 text-sm text-zinc-400 shadow-lg shadow-black/30">
            Spot not found.
          </div>
          <div className="mt-4">
            <Link
              to="/gallery"
              className="text-sm underline text-zinc-300 hover:text-zinc-100"
            >
              ← Back to gallery
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        {/* Top nav actions */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link
              to="/gallery"
              className="text-sm text-zinc-300 hover:text-zinc-100 no-underline"
            >
              ← Back to gallery
            </Link>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-zinc-300 hover:text-zinc-100 no-underline"
            >
              ← Back to map
            </button>
          </div>
        </div>

        {/* Two-column layout (photo left, sidebar right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo card (left, spans 2 cols on desktop) */}
          <section className="lg:col-span-2 rounded-2xl overflow-hidden border border-zinc-700/40 bg-zinc-900/50 shadow-lg shadow-black/30">
            {spot.photoUrl ? (
              <button
                className="w-full bg-black/50 flex items-center justify-center cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open image"
              >
                <img
                  src={spot.photoUrl}
                  alt={spot.title}
                  className="w-full h-auto max-h:[70vh] max-h-[70vh] object-contain"
                  draggable={false}
                />
              </button>
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-sm text-zinc-500">
                No photo
              </div>
            )}
          </section>

          {/* Sidebar card (right) */}
          <aside className="rounded-2xl border border-zinc-700/40 bg-zinc-900/50 shadow-lg shadow-black/30 flex flex-col">
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {isAdmin && isEditing ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                        placeholder="Title"
                      />
                      <div className="mt-1 text-xs text-zinc-400">
                        Added {new Date(spot.createdAt).toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-lg sm:text-xl font-semibold text-zinc-100 break-words">
                        {spot.title || "Untitled"}
                      </h1>
                      <div className="mt-1 text-xs text-zinc-400">
                        Added {new Date(spot.createdAt).toLocaleString()}
                      </div>
                    </>
                  )}
                </div>

                {isAdmin && !isEditing && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleAdminStartEdit}
                      className="rounded-lg px-3 py-1.5 text-xs bg-zinc-700/40 text-zinc-100 border border-zinc-600/60 hover:bg-zinc-600/50"
                    >
                      Edit title/notes
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminDelete}
                      className="rounded-lg px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20"
                    >
                      Delete photo + spot
                    </button>
                  </div>
                )}

                {isAdmin && isEditing && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleAdminSaveEdit}
                      className="rounded-lg px-3 py-1.5 text-xs bg-emerald-500/90 text-zinc-950 border border-emerald-400/80 hover:bg-emerald-400"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminCancelEdit}
                      className="rounded-lg px-3 py-1.5 text-xs bg-zinc-800 text-zinc-200 border border-zinc-600/70 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Rating row: interactive stars + numeric summary */}
              <div className="flex items-center justify-between gap-3">
                <StarRating
                  value={userRated ?? avg ?? 0}
                  onChange={(v) => {
                    const updated = rateSpot(spot.id, v);
                    if (updated) setSpot(updated);
                  }}
                />
                <div className="text-right">
                  <RatingSummary avg={avg} count={voteCount} />
                  {voteCount > 0 ? (
                    <div className="mt-0.5 text-xs text-zinc-400">
                      Average: {(avg ?? 0).toFixed(1)} (
                      {voteCount} {voteCount === 1 ? "vote" : "votes"})
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xs text-zinc-500">
                      No ratings yet
                    </div>
                  )}
                </div>
              </div>

              {/* Notes / description */}
              {isAdmin && isEditing ? (
                <div>
                  <h2 className="text-xs text-zinc-400 mb-1">Notes</h2>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                    placeholder="Details, artist, directions…"
                  />
                </div>
              ) : (
                spot.description && (
                  <div>
                    <h2 className="text-xs text-zinc-400 mb-1">Notes</h2>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                      {spot.description}
                    </p>
                  </div>
                )
              )}

              {/* Verdict actions + tally */}
              <div className="flex items-center gap-3">
                <VerdictButtons spot={spot} onUpdated={(s) => setSpot(s)} />
                <VerdictTally
                  buff={spot.buffCount ?? 0}
                  frame={spot.frameCount ?? 0}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-700/40" />

            {/* Mini-map anchored at bottom of sidebar */}
            <div className="p-4">
              {/* Header row with 'Location' on the left and 'Open in map' on the right */}
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm text-zinc-300">Location</h2>
                <button
                  onClick={() => navigate(`/?focus=${spot.id}`)}
                  className="rounded-lg px-3 py-1.5 text-sm bg-zinc-900/80 border border-zinc-700/50 hover:bg-zinc-800/80 shadow-sm shadow-black/20"
                >
                  Open in map
                </button>
              </div>

              <div className="h-56 w-full rounded-xl overflow-hidden border border-zinc-700/40">
                {center && (
                  <MapContainer
                    center={center}
                    zoom={16}
                    className="h-full w-full"
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    attributionControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Use the same red icon as Explore */}
                    <Marker position={center} icon={RedIcon} />
                  </MapContainer>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {lightboxOpen && spot.photoUrl && (
        <Lightbox
          src={spot.photoUrl}
          alt={spot.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
