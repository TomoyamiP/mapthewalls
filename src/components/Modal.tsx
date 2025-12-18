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

    // ✅ iOS: prevent weird zoom after file input by forcing viewport scale while modal is open
    const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const prevViewportContent = viewportMeta?.getAttribute("content") ?? null;
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
      );
    }

    // 🔒 Lock body scroll (fixes iOS Safari jump/offset after file upload)
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      // blur active element (helps iOS after file picker)
      (document.activeElement as HTMLElement | null)?.blur?.();

      // 🔓 Restore body scroll
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      // restore viewport meta exactly as it was
      if (viewportMeta) {
        if (prevViewportContent) viewportMeta.setAttribute("content", prevViewportContent);
        else viewportMeta.removeAttribute("content");
      }

      // restore scroll position (next tick is more stable on iOS)
      window.removeEventListener("keydown", onKey);
      setTimeout(() => window.scrollTo(0, scrollY), 0);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[9000] flex items-center justify-center
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
