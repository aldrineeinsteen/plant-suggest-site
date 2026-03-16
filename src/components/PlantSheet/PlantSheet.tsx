import { useEffect } from 'react';
import type { PlantRecommendation } from '../../types/planning';
import { PlantCard } from '../PlantCard/PlantCard';

interface Props {
  rec: PlantRecommendation | null;
  onClose: () => void;
}

export function PlantSheet({ rec, onClose }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (!rec) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [rec]);

  // Close on Escape
  useEffect(() => {
    if (!rec) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rec, onClose]);

  if (!rec) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={rec.plant.commonName}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — slides up from bottom on mobile, centred modal on desktop */}
      <div className="relative w-full sm:max-w-lg sm:mx-4 max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden animate-slide-up">
        {/* Sticky handle + header */}
        <div className="shrink-0 px-4 pt-3 pb-2 border-b border-gray-100">
          {/* Drag handle (mobile) */}
          <div className="mx-auto mb-2 w-10 h-1 rounded-full bg-gray-300 sm:hidden" />
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-900 truncate">{rec.plant.commonName}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Render PlantCard without outer article wrapper — reuse content directly */}
          <PlantCard recommendation={rec} inSheet />
        </div>
      </div>
    </div>
  );
}
