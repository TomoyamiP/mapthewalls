// src/lib/votes.ts
import { supabase } from "./supabase";
import { getVoterId } from "./voter";

export type VoteInput = {
  spotId: string;
  rating?: number; // 1–5
  verdict?: "buff" | "frame";
};

export type MyVote = {
  rating: number | null;
  verdict: "buff" | "frame" | null;
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
      { onConflict: "spot_id,voter_id" }
    );

  if (error) {
    console.error("Failed to save vote:", error);
    throw error;
  }
}

export async function loadMyVote(spotId: string): Promise<MyVote> {
  const voterId = getVoterId();

  const { data, error } = await supabase
    .from("spot_votes")
    .select("rating, verdict")
    .eq("spot_id", spotId)
    .eq("voter_id", voterId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load my vote:", error);
    return { rating: null, verdict: null };
  }

  return {
    rating: typeof data?.rating === "number" ? data.rating : null,
    verdict: (data?.verdict as "buff" | "frame" | null) ?? null,
  };
}
