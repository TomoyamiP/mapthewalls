// src/lib/spots.ts
import { supabase } from "./supabaseClient";
import type { GraffitiSpot } from "../types";

// Load all spots from Supabase and map them into GraffitiSpot objects
export async function loadSpotsFromSupabase(): Promise<GraffitiSpot[]> {
  const { data, error } = await supabase
    .from("spots")
    .select("id, created_at, lat, lng, image_url, title, note")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to load spots:", error);
    return [];
  }

  if (!data) return [];

  // Map DB rows → GraffitiSpot
  return data.map((row: any): GraffitiSpot => ({
    id: row.id,
    title: row.title ?? "",
    description: row.note ?? undefined,
    photoUrl: row.image_url ?? undefined,
    photoPath: undefined, // we’re not using this from Supabase yet
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
  }));
}

// Save a new spot to Supabase
export async function saveSpotToSupabase(spot: {
  lat: number;
  lng: number;
  image_url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  note?: string | null;
}) {
  const { data, error } = await supabase
    .from("spots")
    .insert([spot])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Failed to save spot:", error);
    return null;
  }

  return data;
}
