import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[20000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-[20010] w-[92vw] max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-2xl">
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold">{title ?? "Modal"}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-800"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
