// src/components/VerdictButtons.tsx
import { useState } from "react";
import { Eraser, Square } from "lucide-react";
import type { GraffitiSpot } from "../types";
import { upsertVote } from "../lib/votes";
import { loadVoteSummary } from "../lib/voteSummary";

type Props = {
  spot: GraffitiSpot;
  onUpdated: (s: GraffitiSpot) => void;
  className?: string;
  activeVerdict?: "buff" | "frame" | null;
  onActiveVerdictChange?: (v: "buff" | "frame" | null) => void;
};

export default function VerdictButtons({
  spot,
  onUpdated,
  className = "",
  activeVerdict = null,
  onActiveVerdictChange,
}: Props) {
  const [pending, setPending] = useState<"buff" | "frame" | null>(null);

  async function choose(kind: "buff" | "frame") {
    try {
      setPending(kind);

      // Save my verdict to Supabase (upsert by spot_id + voter_id)
      await upsertVote({ spotId: spot.id, verdict: kind });

      // Update highlight immediately
      onActiveVerdictChange?.(kind);

      // Pull fresh totals from Supabase
      const summary = await loadVoteSummary(spot.id);

      onUpdated({
        ...spot,
        buffCount: summary.buff,
        frameCount: summary.frame,
      });
    } catch (e) {
      console.error(e);
      alert("Could not save your vote. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => choose("buff")}
        disabled={!!pending}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm
          border transition ${
            activeVerdict === "buff"
              ? "bg-zinc-100 text-zinc-900 border-zinc-300"
              : "bg-zinc-900/80 text-zinc-100 border-zinc-700/50 hover:bg-zinc-800/80"
          }`}
      >
        <Eraser size={16} />
        <span>Buff it</span>
      </button>

      <button
        type="button"
        onClick={() => choose("frame")}
        disabled={!!pending}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm
          border transition ${
            activeVerdict === "frame"
              ? "bg-zinc-100 text-zinc-900 border-zinc-300"
              : "bg-zinc-900/80 text-zinc-100 border-zinc-700/50 hover:bg-zinc-800/80"
          }`}
      >
        <Square size={16} />
        <span>Frame it</span>
      </button>
    </div>
  );
}
