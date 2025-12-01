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
