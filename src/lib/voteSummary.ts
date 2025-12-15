// src/lib/voteSummary.ts
import { supabase } from "./supabase";

export type VoteSummary = {
  avg: number | null;
  count: number;
  buff: number;
  frame: number;
};

export async function loadVoteSummary(spotId: string): Promise<VoteSummary> {
  const { data, error } = await supabase
    .from("spot_votes")
    .select("rating, verdict")
    .eq("spot_id", spotId);

  if (error) {
    console.error("Failed to load vote summary:", error);
    return { avg: null, count: 0, buff: 0, frame: 0 };
  }

  let sum = 0;
  let count = 0;
  let buff = 0;
  let frame = 0;

  for (const row of data) {
    if (typeof row.rating === "number") {
      sum += row.rating;
      count += 1;
    }
    if (row.verdict === "buff") buff += 1;
    if (row.verdict === "frame") frame += 1;
  }

  return {
    avg: count > 0 ? sum / count : null,
    count,
    buff,
    frame,
  };
}
