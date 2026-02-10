// src/components/Modal.tsx
import { useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      // ✅ Only blur when we just transitioned from open -> closed
      if (wasOpenRef.current) {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;

    // ✅ iOS: prevent weird zoom after file input by forcing viewport scale while modal is open
    const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const prevViewportContent = viewportMeta?.getAttribute("content") ?? null;
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
      );
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      // restore viewport meta exactly as it was
      if (viewportMeta) {
        if (prevViewportContent) viewportMeta.setAttribute("content", prevViewportContent);
        else viewportMeta.removeAttribute("content");
      }

      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[9000]
                 overflow-hidden
                 flex items-center justify-center
                 bg-zinc-900/60 backdrop-blur-sm text-zinc-100 p-6"
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
