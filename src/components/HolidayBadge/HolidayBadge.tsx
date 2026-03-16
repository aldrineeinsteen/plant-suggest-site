import type { HolidayHighlight } from '../../types';

const WINDOW_TYPE_LABELS: Record<string, string> = {
  indoorSeedStart: 'indoor start',
  directSow: 'direct sow',
  transplant: 'transplant',
  firstHarvest: 'first harvest',
  harvest: 'harvest',
};

interface Props {
  highlight: HolidayHighlight;
}

export function HolidayBadge({ highlight }: Props) {
  const isBest = highlight.quality === 'best';
  return (
    <div
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
        isBest
          ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
      }`}
    >
      <span aria-hidden="true">{isBest ? '★' : '☆'}</span>
      <span>
        <span className="font-semibold">{isBest ? 'Best option' : 'Good opportunity'}</span>
        {' — '}
        {WINDOW_TYPE_LABELS[highlight.windowType]} aligns with{' '}
        <span className="font-medium">{highlight.holiday.name}</span>
      </span>
    </div>
  );
}
