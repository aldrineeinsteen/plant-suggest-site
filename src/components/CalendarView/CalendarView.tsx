import { useMemo, useRef } from 'react';
import type { PlantRecommendation, WindowType } from '../../types/planning';
import {
  buildCalendarMonths,
  getWindowTypeAtSlot,
  getActiveWindowsForMonth,
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
  onSelectPlant: (rec: PlantRecommendation) => void;
}

const WINDOW_COLOURS: Record<WindowType, string> = {
  indoorSeedStart: 'bg-purple-200 dark:bg-purple-800',
  directSow: 'bg-yellow-200 dark:bg-yellow-800',
  transplant: 'bg-blue-200 dark:bg-blue-800',
  firstHarvest: 'bg-orange-200 dark:bg-orange-800',
  harvest: 'bg-green-200 dark:bg-green-800',
};

const LEGEND_ITEMS: { type: WindowType; label: string }[] = [
  { type: 'indoorSeedStart', label: 'Indoor start' },
  { type: 'directSow', label: 'Direct sow' },
  { type: 'transplant', label: 'Transplant' },
  { type: 'firstHarvest', label: 'First harvest' },
  { type: 'harvest', label: 'Harvest' },
];

const PARTS = [1, 2, 3, 4] as const;

export default function CalendarView({ recommendations, startMonth, startYear, monthOffset, onNavigate, onReset, onSelectPlant }: CalendarViewProps) {
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
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400 transition select-none"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
            {MONTH_SHORT[startMonth - 1]} {startYear}
          </span>
          {monthOffset !== 0 && (
            <button
              onClick={onReset}
              className="rounded-full border border-brand-300 dark:border-gray-600 bg-brand-50 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-gray-600 transition"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={() => onNavigate(1)}
          aria-label="Next month"
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400 transition select-none"
        >
          →
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
        {LEGEND_ITEMS.map(({ type, label }) => (
          <span key={type} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-3 rounded-sm ${WINDOW_COLOURS[type]}`} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
          E=Early &nbsp;M=Mid &nbsp;L=Late &nbsp;X=End
        </span>
      </div>

      {/* ── Mobile layout (one month at a time, vertical list) ── */}
      {(() => {
        const upcomingMonths = [1, 2].map((d) => {
          const ud = new Date(startYear, startMonth - 1 + d, 1);
          return { month: ud.getMonth() + 1, year: ud.getFullYear() };
        });

        const thisMonthRecs = recommendations.filter(
          (r) => getActiveWindowsForMonth(r, startMonth, startYear).length > 0
        );
        const upcomingRecs = recommendations.filter(
          (r) =>
            getActiveWindowsForMonth(r, startMonth, startYear).length === 0 &&
            upcomingMonths.some((um) => getActiveWindowsForMonth(r, um.month, um.year).length > 0)
        );

        const WINDOW_LABEL: Record<string, string> = {
          indoorSeedStart: 'Indoor start',
          directSow: 'Direct sow',
          transplant: 'Transplant',
          firstHarvest: 'First harvest',
          harvest: 'Harvest',
        };

        const PlantRow = ({ rec }: { rec: (typeof recommendations)[0] }) => {
          const windows = getActiveWindowsForMonth(rec, startMonth, startYear);
          return (
            <button
              type="button"
              onClick={() => onSelectPlant(rec)}
              className="w-full flex items-start justify-between gap-2 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-left active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">{rec.plant.commonName}</span>
                {rec.isNextSeason && (
                  <span className="inline-block self-start rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900 px-1.5 py-px text-[10px] font-medium text-indigo-600 dark:text-indigo-300 leading-tight">
                    Next season
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex flex-wrap justify-end gap-1">
                  {(windows.length > 0 ? windows : upcomingMonths.flatMap((um) => getActiveWindowsForMonth(rec, um.month, um.year))).map((w) => (
                    <span
                      key={w}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${WINDOW_COLOURS[w]} text-gray-700 dark:text-gray-200`}
                    >
                      {WINDOW_LABEL[w]}
                    </span>
                  ))}
                </div>
                <span className="text-gray-300 dark:text-gray-600 text-sm" aria-hidden="true">›</span>
              </div>
            </button>
          );
        };

        return (
          <div className="sm:hidden">
            {thisMonthRecs.length === 0 && upcomingRecs.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-10">
                Nothing to do this month — tap → to look ahead
              </p>
            ) : (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {thisMonthRecs.length > 0 && (
                  <div>
                    <div className="bg-brand-600 px-4 py-2">
                      <span className="text-xs font-semibold text-white tracking-wide uppercase">This month</span>
                    </div>
                    <div className="divide-y divide-gray-100 px-4">
                      {thisMonthRecs.map((r) => <PlantRow key={r.plant.id} rec={r} />)}
                    </div>
                  </div>
                )}
                {upcomingRecs.length > 0 && (
                  <div className={thisMonthRecs.length > 0 ? 'border-t border-gray-200' : ''}>
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">Coming up</span>
                    </div>
                    <div className="divide-y divide-gray-100 px-4">
                      {upcomingRecs.map((r) => <PlantRow key={r.plant.id} rec={r} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Desktop layout (horizontal table) ── */}
      <div className="hidden sm:block">
      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-280px)] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="border-collapse text-xs w-full min-w-max">
          <thead>
            {/* Row 1 — month labels */}
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th
                className="sticky left-0 top-0 z-30 bg-gray-100 dark:bg-gray-800 text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 min-w-[140px]"
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
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                      i === 0 ? '' : cm.isOverflow
                          ? 'border-l-2 border-dashed border-gray-400 dark:border-gray-600'
                          : 'border-l border-gray-300 dark:border-gray-700',
                    ].join(' ')}
                  >
                    {cm.label}
                  </th>
                );
              })}
            </tr>

            {/* Row 2 — part labels (E M L X) */}
            <tr className="bg-gray-50 dark:bg-gray-800/80">
              {calendarMonths.map((cm, mi) =>
                PARTS.map((part) => (
                  <th
                    key={`${cm.year}-${cm.month}-${part}`}
                    className={[
                      'sticky top-[25px] z-20 text-center py-1 font-normal w-6 border-b border-gray-200',
                      cm.month === todayMonth && cm.year === todayYear
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-gray-50 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500',
                      part === 1
                        ? mi === 0
                          ? ''
                          : cm.isOverflow
                            ? 'border-l-2 border-dashed border-gray-400 dark:border-gray-600'
                            : 'border-l border-gray-300 dark:border-gray-700'
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
                className={ri % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
              >
                {/* Plant name cell */}
                <td className="sticky left-0 z-10 bg-inherit px-3 py-1 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap border-r border-gray-300 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => onSelectPlant(rec)}
                    className="flex items-center gap-1.5 flex-wrap text-left hover:text-brand-700 dark:hover:text-brand-400 transition-colors cursor-pointer"
                  >
                    {rec.plant.commonName}
                    {rec.isNextSeason && (
                      <span className="inline-block rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900 px-1.5 py-px text-[10px] font-medium text-indigo-600 dark:text-indigo-300 leading-tight">
                        Next season
                      </span>
                    )}
                  </button>
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
                          ? 'border-l-2 border-dashed border-gray-400 dark:border-gray-600'
                          : 'border-l border-gray-300 dark:border-gray-700'
                      : '';

                    return (
                      <td
                        key={`${cm.year}-${cm.month}-${part}`}
                        title={type ? `${rec.plant.commonName}: ${type}` : undefined}
                        className={[
                          'w-6 h-6 p-0',
                          borderClass,
                          type ? WINDOW_COLOURS[type] : isCurrentMonth ? 'bg-brand-50 dark:bg-gray-700/50' : 'bg-transparent',
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
      </div>{/* end desktop wrapper */}
    </div>
  );
}
