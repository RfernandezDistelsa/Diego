"use client";

import { useEffect } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function CreateTaskModal({ isOpen, onClose, children }: CreateTaskModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full pointer-events-auto border border-gray-200 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            ✕
          </button>

          <div className="p-6 pt-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
