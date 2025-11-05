// src/components/Modal.tsx
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
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
      aria-modal="true"
      role="dialog"
      // unified dark overlay with white text
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm text-zinc-100 p-6"
      onClick={onClose}
    >
      <div
        className="max-w-2xl text-center leading-relaxed"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
