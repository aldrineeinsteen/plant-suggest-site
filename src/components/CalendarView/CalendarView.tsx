import { useMemo, useRef } from 'react';
import type { PlantRecommendation, WindowType } from '../../types/planning';
import {
  buildCalendarMonths,
  getWindowTypeAtSlot,
  getSlotStatus,
  needsOverflowMonths,
  partLabel,
  type CalendarMonth,
  type SlotStatus,
} from '../../lib/calendarBuilder';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_CLASS: Record<NonNullable<SlotStatus>, string> = {
  ideal: '',
  'still-possible': 'opacity-60',
  'late-start': 'opacity-30',
};

interface CalendarViewProps {
  recommendations: PlantRecommendation[];
  startMonth: number;
  startYear: number;
  monthOffset: number;
  onNavigate: (delta: number) => void;
  onReset: () => void;
}

const WINDOW_COLOURS: Record<WindowType, string> = {
  indoorSeedStart: 'bg-purple-200',
  directSow: 'bg-yellow-200',
  transplant: 'bg-blue-200',
  firstHarvest: 'bg-orange-200',
  harvest: 'bg-green-200',
};

const LEGEND_ITEMS: { type: WindowType; label: string }[] = [
  { type: 'indoorSeedStart', label: 'Indoor start' },
  { type: 'directSow', label: 'Direct sow' },
  { type: 'transplant', label: 'Transplant' },
  { type: 'firstHarvest', label: 'First harvest' },
  { type: 'harvest', label: 'Harvest' },
];

const PARTS = [1, 2, 3, 4] as const;

export default function CalendarView({ recommendations, startMonth, startYear, monthOffset, onNavigate, onReset }: CalendarViewProps) {
  const swipeStartX = useRef<number | null>(null);

  const todayOrd = useMemo(() => {
    const n = new Date();
    const m = n.getMonth() + 1;
    const y = n.getFullYear();
    const day = n.getDate();
    const part = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4;
    return y * 48 + (m - 1) * 4 + (part - 1);
  }, []);

  const todayMonth = new Date().getMonth() + 1;
  const todayYear = new Date().getFullYear();

  const baseMonths = useMemo(
    () => buildCalendarMonths(startMonth, startYear, 12, 0),
    [startMonth, startYear],
  );

  const overflowCount = useMemo(
    () => needsOverflowMonths(recommendations, baseMonths),
    [recommendations, baseMonths],
  );

  const calendarMonths: CalendarMonth[] = useMemo(
    () => buildCalendarMonths(startMonth, startYear, 12, overflowCount),
    [startMonth, startYear, overflowCount],
  );

  if (recommendations.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        No plants match the selected filters.
      </p>
    );
  }

  function handlePointerDown(e: React.PointerEvent) {
    swipeStartX.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (swipeStartX.current === null) return;
    const delta = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(delta) > 50) onNavigate(delta < 0 ? 1 : -1);
  }

  return (
    <div
      className="space-y-3"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(-1)}
          aria-label="Previous month"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-brand-400 hover:text-brand-700 transition select-none"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 tabular-nums">
            {MONTH_SHORT[startMonth - 1]} {startYear}
          </span>
          {monthOffset !== -2 && (
            <button
              onClick={onReset}
              className="rounded-full border border-brand-300 bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={() => onNavigate(1)}
          aria-label="Next month"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-brand-400 hover:text-brand-700 transition select-none"
        >
          →
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {LEGEND_ITEMS.map(({ type, label }) => (
          <span key={type} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-3 rounded-sm ${WINDOW_COLOURS[type]}`} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1 text-gray-400">
          E=Early &nbsp;M=Mid &nbsp;L=Late &nbsp;X=End
        </span>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-280px)] rounded-lg border border-gray-200 shadow-sm">
        <table className="border-collapse text-xs w-full min-w-max">
          <thead>
            {/* Row 1 — month labels */}
            <tr className="bg-gray-100">
              <th
                className="sticky left-0 top-0 z-30 bg-gray-100 text-left px-3 py-2 font-semibold text-gray-700 whitespace-nowrap border-r border-gray-300 min-w-[140px]"
                rowSpan={2}
              >
                Plant
              </th>
              {calendarMonths.map((cm, i) => {
                const isCurrentMonth = cm.month === todayMonth && cm.year === todayYear;
                return (
                  <th
                    key={`${cm.year}-${cm.month}`}
                    colSpan={4}
                    className={[
                      'sticky top-0 z-20 text-center px-1 py-1 font-medium whitespace-nowrap',
                      isCurrentMonth
                        ? 'bg-brand-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600',
                      i === 0 ? '' : cm.isOverflow
                        ? 'border-l-2 border-dashed border-gray-400'
                        : 'border-l border-gray-300',
                    ].join(' ')}
                  >
                    {cm.label}
                  </th>
                );
              })}
            </tr>

            {/* Row 2 — part labels (E M L X) */}
            <tr className="bg-gray-50">
              {calendarMonths.map((cm, mi) =>
                PARTS.map((part) => (
                  <th
                    key={`${cm.year}-${cm.month}-${part}`}
                    className={[
                      'sticky top-[25px] z-20 text-center py-1 font-normal w-6 border-b border-gray-200',
                      cm.month === todayMonth && cm.year === todayYear
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-gray-50 text-gray-400',
                      part === 1
                        ? mi === 0
                          ? ''
                          : cm.isOverflow
                            ? 'border-l-2 border-dashed border-gray-400'
                            : 'border-l border-gray-300'
                        : '',
                    ].join(' ')}
                  >
                    {partLabel(part)}
                  </th>
                )),
              )}
            </tr>
          </thead>

          <tbody>
            {recommendations.map((rec, ri) => (
              <tr
                key={rec.plant.id}
                className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              >
                {/* Plant name cell */}
                <td className="sticky left-0 z-10 bg-inherit px-3 py-1 font-medium text-gray-800 whitespace-nowrap border-r border-gray-300">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    {rec.plant.commonName}
                    {rec.isNextSeason && (
                      <span className="inline-block rounded-full border border-indigo-100 bg-indigo-50 px-1.5 py-px text-[10px] font-medium text-indigo-600 leading-tight">
                        Next season
                      </span>
                    )}
                  </span>
                </td>

                {/* Slot cells */}
                {calendarMonths.map((cm, mi) =>
                  PARTS.map((part) => {
                    const type = getWindowTypeAtSlot(rec, cm.month, cm.year, part);
                    const status = getSlotStatus(type, cm.month, cm.year, part, todayOrd);
                    const isCurrentMonth = cm.month === todayMonth && cm.year === todayYear;
                    const isFirstPart = part === 1;
                    const borderClass = isFirstPart
                      ? mi === 0
                        ? ''
                        : cm.isOverflow
                          ? 'border-l-2 border-dashed border-gray-400'
                          : 'border-l border-gray-300'
                      : '';

                    return (
                      <td
                        key={`${cm.year}-${cm.month}-${part}`}
                        title={type ? `${rec.plant.commonName}: ${type}` : undefined}
                        className={[
                          'w-6 h-6 p-0',
                          borderClass,
                          type ? WINDOW_COLOURS[type] : isCurrentMonth ? 'bg-brand-50' : 'bg-transparent',
                          status ? STATUS_CLASS[status] : '',
                        ].join(' ')}
                      />
                    );
                  }),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
