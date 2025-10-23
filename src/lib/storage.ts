import type { GraffitiSpot } from "../types";

const KEY = "graffitiSpots";

export function loadSpots(): GraffitiSpot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as GraffitiSpot[];
    return [];
  } catch {
    return [];
  }
}

export function saveSpots(spots: GraffitiSpot[]) {
  localStorage.setItem(KEY, JSON.stringify(spots));
}

export function addSpot(spot: GraffitiSpot) {
  const all = loadSpots();
  all.push(spot);
  saveSpots(all);
}
