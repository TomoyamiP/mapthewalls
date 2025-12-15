// src/components/VerdictButtons.tsx
import { useMemo, useState } from "react";
import { Eraser, Square } from "lucide-react";
import type { GraffitiSpot } from "../types";
import { getLocalVote, voteVerdict } from "../lib/storage";
import { upsertVote } from "../lib/votes";

type Props = {
  spot: GraffitiSpot;
  onUpdated: (s: GraffitiSpot) => void;
  className?: string;
};

export default function VerdictButtons({ spot, onUpdated, className = "" }: Props) {
  const local = useMemo(() => getLocalVote(spot.id), [spot.id]);
  const [pending, setPending] = useState<"buff" | "frame" | null>(null);

  async function choose(kind: "buff" | "frame") {
    setPending(kind);

    // 1) Always update locally first (never “dead”)
    const updated = voteVerdict(spot.id, kind);
    if (updated) onUpdated(updated);

    // 2) Best-effort save to Supabase
    try {
      await upsertVote({ spotId: spot.id, verdict: kind });
    } catch (err) {
      console.warn("Supabase verdict save failed:", err);
    } finally {
      setPending(null);
    }
  }

  const active = local.verdict ?? null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => choose("buff")}
        disabled={!!pending}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm
                    border transition ${
                      active === "buff"
                        ? "bg-zinc-100 text-zinc-900 border-zinc-300"
                        : "bg-zinc-900/80 text-zinc-100 border border-zinc-700/50 hover:bg-zinc-800/80"
                    } ${pending ? "opacity-70" : ""}`}
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
                      active === "frame"
                        ? "bg-zinc-100 text-zinc-900 border-zinc-300"
                        : "bg-zinc-900/80 text-zinc-100 border border-zinc-700/50 hover:bg-zinc-800/80"
                    } ${pending ? "opacity-70" : ""}`}
      >
        <Square size={16} />
        <span>Frame it</span>
      </button>
    </div>
  );
}
