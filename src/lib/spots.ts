// src/lib/spots.ts
import { supabase } from "./supabaseClient";
import type { GraffitiSpot } from "../types";

// Load all spots from Supabase and map them into GraffitiSpot objects
export async function loadSpotsFromSupabase(): Promise<GraffitiSpot[]> {
  const { data, error } = await supabase
    .from("spots")
    .select(
      "id, created_at, lat, lng, image_url, title, note, rating_sum, rating_count"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to load spots:", error);
    return [];
  }

  if (!data) return [];

  return data.map((row: any): GraffitiSpot => ({
    id: row.id,
    title: row.title ?? "",
    description: row.note ?? undefined,
    photoUrl: row.image_url ?? undefined,
    photoPath: undefined,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,

    // Inject rating fields from Supabase so your UI can calculate averages
    ratingSum: row.rating_sum ?? 0,
    ratingCount: row.rating_count ?? 0,
  }));
}

// Save a new spot to Supabase
// Save a new spot to Supabase
export async function saveSpotToSupabase(spot: {
  id: string;
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

// Update rating_sum and rating_count for a spot in Supabase
export async function updateSpotRatingInSupabase(
  id: string,
  newRatingSum: number,
  newRatingCount: number
) {
  const { error } = await supabase
    .from("spots")
    .update({
      rating_sum: newRatingSum,
      rating_count: newRatingCount,
    })
    .eq("id", id);

  if (error) {
    console.error("[Supabase] Failed to update rating:", error);
    return null;
  }

  return true;
}

// ✅ Admin: update spot title/description in Supabase so Archive reflects changes
export async function updateSpotMetaInSupabase(
  spotId: string,
  patch: { title: string; description?: string | null }
) {
  const { data, error } = await supabase
    .from("spots")
    .update({
      title: patch.title,
      description: patch.description ?? null,
    })
    .eq("id", spotId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update spot meta:", error);
    throw error;
  }

  return data;
}
