"use client";

import { useEffect, useRef } from "react";

interface UndoToastProps {
  isVisible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  taskTitle: string;
  autoCloseDuration?: number;
}

export function UndoToast({
  isVisible,
  onUndo,
  onDismiss,
  taskTitle,
  autoCloseDuration = 5000,
}: UndoToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    timerRef.current = setTimeout(() => {
      onDismiss();
    }, autoCloseDuration);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVisible, autoCloseDuration, onDismiss]);

  useEffect(() => {
    if (!isVisible) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onDismiss();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#FF8C42] text-white px-6 py-3 rounded-lg shadow-lg text-sm border border-orange-500 animate-slide-up"
    >
      <span>
        <span className="font-medium">"{taskTitle}"</span> deleted
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="text-white underline font-semibold hover:text-amber-100 transition-colors"
        aria-label="Undo"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-white opacity-70 hover:opacity-100 transition-opacity ml-2"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
