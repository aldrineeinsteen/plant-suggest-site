import type { PlanningWindow, WindowType } from '../../types';

const WINDOW_LABELS: Record<WindowType, string> = {
  indoorSeedStart: 'Indoor Start',
  directSow: 'Direct Sow',
  transplant: 'Transplant',
  firstHarvest: 'First Harvest',
  harvest: 'Harvest',
};

const WINDOW_COLOURS: Record<WindowType, string> = {
  indoorSeedStart: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
  directSow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
  transplant: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
  firstHarvest: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800',
  harvest: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
};

interface Props {
  windowType: WindowType;
  window: PlanningWindow;
}

export function WindowBadge({ windowType, window }: Props) {
  return (
    <div className={`rounded-md border px-2 py-1 text-xs ${WINDOW_COLOURS[windowType]}`}>
      <span className="font-semibold">{WINDOW_LABELS[windowType]}:</span>{' '}
      <span>{window.label}</span>
    </div>
  );
}
