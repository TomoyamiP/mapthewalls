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

  const { error } = await supabase
    .from("spot_votes")
    .upsert(
      {
        spot_id: spotId,
        voter_id: voterId,
        rating: rating ?? null,
        verdict: verdict ?? null,
      },
      {
        onConflict: "spot_id,voter_id",
      }
    );

  if (error) {
    console.error("Failed to save vote:", error);
    throw error;
  }
}
