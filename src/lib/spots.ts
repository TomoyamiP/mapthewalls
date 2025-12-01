// src/lib/spots.ts
import { supabase } from "./supabaseClient";

// Load all spots from Supabase
export async function loadSpotsFromSupabase() {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to load spots:", error);
    return [];
  }

  return data ?? [];
}

// Save a new spot to Supabase
export async function saveSpotToSupabase(spot: {
  lat: number;
  lng: number;
  image_url: string;
  thumbnail_url?: string;
  title?: string;
  note?: string;
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
