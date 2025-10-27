// src/components/RatingSummary.tsx
type Props = {
  avg: number | null;   // null if no ratings
  count: number;        // 0..n
  className?: string;
};

export default function RatingSummary({ avg, count, className = "" }: Props) {
  if (!avg || count <= 0) {
    return <span className={`text-xs text-zinc-400 ${className}`}>No ratings yet</span>;
  }
  return (
    <span className={`text-xs text-zinc-300 ${className}`}>
      {avg.toFixed(1)} ({count})
    </span>
  );
}
