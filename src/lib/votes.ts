// src/lib/votes.ts
import { supabase } from "./supabase";
import { getVoterId } from "./voter";

export type VoteInput = {
  spotId: string;
  rating?: number; // 1–5
  verdict?: "buff" | "frame";
};

export async function upsertVote({ spotId, rating, verdict }: VoteInput) {
  const voterId = getVoterId();

  // ✅ IMPORTANT:
  // Only include the fields the user is actually updating.
  // If we send rating: null when clicking verdict, it erases stars (and vice versa).
  const payload: Record<string, any> = {
    spot_id: spotId,
    voter_id: voterId,
  };

  if (rating !== undefined) payload.rating = rating;
  if (verdict !== undefined) payload.verdict = verdict;

  const { error } = await supabase.from("spot_votes").upsert(payload, {
    onConflict: "spot_id,voter_id",
  });

  if (error) {
    console.error("Failed to save vote:", error);
    throw error;
  }
}
