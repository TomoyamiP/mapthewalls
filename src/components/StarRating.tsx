// src/components/StarRating.tsx
import { useState } from "react";

type Props = {
  value: number;              // 0..5 (can be fractional for readOnly)
  onChange?: (v: 1|2|3|4|5) => void;
  readOnly?: boolean;
  size?: number;              // px
  className?: string;
};

export default function StarRating({ value, onChange, readOnly, size = 18, className = "" }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  // Renders 5 filled/empty stars based on `display`
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {[1,2,3,4,5].map((i) => {
        const filled = display >= i - 0.01; // treat fractional nicely
        const color = filled ? "text-yellow-400" : "text-zinc-600";
        return (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${i} star${i>1?"s":""}`}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(i)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange?.(i as 1|2|3|4|5)}
            className={`p-0.5 ${readOnly ? "cursor-default" : "cursor-pointer"} disabled:cursor-default`}
          >
            {/* Inline SVG star (filled by currentColor) */}
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className={color}
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.239l-7.19-.61L12 2 9.19 8.629 2 9.239l5.46 4.731L5.82 21z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
