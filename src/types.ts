// src/types.ts

export type VerdictChoice = "buff" | "frame";

export interface GraffitiSpot {
  id: string;
  title: string;
  description?: string;
  photoUrl?: string;
  photoPath?: string;
  lat: number;
  lng: number;
  createdAt: string; // ISO string

  // Ratings (local-first aggregate)
  ratingSum?: number;   // sum of 1–5 ratings
  ratingCount?: number; // number of ratings

  // “Buff it / Frame it” tallies
  buffCount?: number;
  frameCount?: number;
}
