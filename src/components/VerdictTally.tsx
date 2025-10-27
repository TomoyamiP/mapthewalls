// src/components/VerdictTally.tsx
type Props = {
  buff: number;
  frame: number;
  className?: string;
};

export default function VerdictTally({ buff, frame, className = "" }: Props) {
  return (
    <div className={`text-xs text-zinc-400 ${className}`}>
      Buff {buff} · Frame {frame}
    </div>
  );
}
