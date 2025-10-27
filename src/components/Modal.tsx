// src/components/Modal.tsx
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[20000] flex items-center justify-center"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        className="relative w-[min(92vw,560px)] rounded-2xl border border-zinc-800
                   bg-zinc-900/85 text-zinc-100 shadow-2xl
                   animate-[fadeIn_120ms_ease-out]
                   px-4 py-4 sm:px-6 sm:py-6"
        // prevent backdrop click from closing when clicking inside
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium tracking-wide">{title}</h2>
          </div>
        )}

        <div className="space-y-4">{children}</div>

        {/* Footer close (mobile-visible, optional) */}
        <div className="mt-5 sm:mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>

      {/* tiny keyframe for entry */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
