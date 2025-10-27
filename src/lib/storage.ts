// src/lib/storage.ts
import type { GraffitiSpot, VerdictChoice } from "../types";

const KEY = "graffitiSpots";
const VOTES_KEY = "graffitiLocalVotes:v1";

type LocalVote = {
  // last rating from this device for a given spot (1..5)
  rated?: 1 | 2 | 3 | 4 | 5;
  // last verdict from this device for a given spot
  verdict?: VerdictChoice | null;
};

type LocalVotesMap = Record<string, LocalVote>;

/* ------------------- internal: local votes map ------------------- */
function loadVotes(): LocalVotesMap {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function saveVotes(v: LocalVotesMap) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(v));
}

/* ------------------- core storage (spots) ------------------- */
export function loadSpots(): GraffitiSpot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Migration: ensure new fields exist and are numbers
    const migrated = (parsed as GraffitiSpot[]).map((s) => ({
      ...s,
      ratingSum: typeof s.ratingSum === "number" ? s.ratingSum : 0,
      ratingCount: typeof s.ratingCount === "number" ? s.ratingCount : 0,
      buffCount: typeof s.buffCount === "number" ? s.buffCount : 0,
      frameCount: typeof s.frameCount === "number" ? s.frameCount : 0,
    }));
    return migrated;
  } catch {
    return [];
  }
}

export function saveSpots(spots: GraffitiSpot[]) {
  localStorage.setItem(KEY, JSON.stringify(spots));
}

export function addSpot(spot: GraffitiSpot) {
  const all = loadSpots();
  all.push({
    ...spot,
    ratingSum: typeof spot.ratingSum === "number" ? spot.ratingSum : 0,
    ratingCount: typeof spot.ratingCount === "number" ? spot.ratingCount : 0,
    buffCount: typeof spot.buffCount === "number" ? spot.buffCount : 0,
    frameCount: typeof spot.frameCount === "number" ? spot.frameCount : 0,
  });
  saveSpots(all);
}

/* ------------------- helpers: query/update by id ------------------- */
function findSpotIndex(spots: GraffitiSpot[], id: string) {
  return spots.findIndex((s) => s.id === id);
}

export function getSpotById(id: string): GraffitiSpot | null {
  const all = loadSpots();
  const i = findSpotIndex(all, id);
  return i >= 0 ? all[i] : null;
}

/* ------------------- ratings (1–5) ------------------- */
/**
 * Rate a spot from this device. One rating per device (editable).
 * - If user rated before, we adjust the running sum (no change to count).
 * - If first time rating, we add to sum and increment count.
 * Returns the updated spot, or null if not found/invalid input.
 */
export function rateSpot(spotId: string, stars: number): GraffitiSpot | null {
  const val = Math.round(stars);
  if (val < 1 || val > 5) return null;

  const spots = loadSpots();
  const idx = findSpotIndex(spots, spotId);
  if (idx < 0) return null;

  const votes = loadVotes();
  const prev = votes[spotId]?.rated;

  // Clone spot to mutate
  const spot = { ...spots[idx] };

  if (prev && prev >= 1 && prev <= 5) {
    // Edit existing rating: adjust sum only
    spot.ratingSum = (spot.ratingSum ?? 0) + (val - prev);
    // ratingCount unchanged
  } else {
    // First time rating
    spot.ratingSum = (spot.ratingSum ?? 0) + val;
    spot.ratingCount = (spot.ratingCount ?? 0) + 1;
  }

  // Persist spot
  spots[idx] = spot;
  saveSpots(spots);

  // Persist local vote
  votes[spotId] = { ...(votes[spotId] || {}), rated: val as 1 | 2 | 3 | 4 | 5 };
  saveVotes(votes);

  return spot;
}

/* ------------------- verdicts: "buff" / "frame" ------------------- */
/**
 * Toggle/select a verdict from this device.
 * - If selecting the same verdict again → clears it (decrement count).
 * - If switching from the other verdict → move one from other to selected.
 * Returns the updated spot, or null if not found.
 */
export function voteVerdict(
  spotId: string,
  choice: VerdictChoice
): GraffitiSpot | null {
  const spots = loadSpots();
  const idx = findSpotIndex(spots, spotId);
  if (idx < 0) return null;

  const votes = loadVotes();
  const prev = votes[spotId]?.verdict ?? null;

  const spot = { ...spots[idx] };
  spot.buffCount = spot.buffCount ?? 0;
  spot.frameCount = spot.frameCount ?? 0;

  if (prev === choice) {
    // Clear same vote
    if (choice === "buff" && spot.buffCount > 0) spot.buffCount--;
    if (choice === "frame" && spot.frameCount > 0) spot.frameCount--;
    votes[spotId] = { ...(votes[spotId] || {}), verdict: null };
  } else {
    // Switch or first set
    if (prev === "buff" && spot.buffCount > 0) spot.buffCount--;
    if (prev === "frame" && spot.frameCount > 0) spot.frameCount--;
    if (choice === "buff") spot.buffCount++;
    if (choice === "frame") spot.frameCount++;
    votes[spotId] = { ...(votes[spotId] || {}), verdict: choice };
  }

  spots[idx] = spot;
  saveSpots(spots);
  saveVotes(votes);

  return spot;
}

/* ------------------- convenience ------------------- */
export function getAverageRating(spot: GraffitiSpot): number | null {
  if (!spot.ratingCount || spot.ratingCount <= 0) return null;
  return (spot.ratingSum ?? 0) / spot.ratingCount;
}

export function getLocalVote(spotId: string): LocalVote {
  const votes = loadVotes();
  return votes[spotId] || {};
}
