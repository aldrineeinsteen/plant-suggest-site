import { useMemo } from 'react';
import type { PlantRecommendation, WindowType } from '../../types/planning';
import {
  buildCalendarMonths,
  getWindowTypeAtSlot,
  needsOverflowMonths,
  partLabel,
  type CalendarMonth,
} from '../../lib/calendarBuilder';

interface CalendarViewProps {
  recommendations: PlantRecommendation[];
  startMonth: number;
  startYear: number;
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

export default function CalendarView({ recommendations, startMonth, startYear }: CalendarViewProps) {
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

  return (
    <div className="space-y-3">
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="border-collapse text-xs w-full min-w-max">
          <thead>
            {/* Row 1 — month labels */}
            <tr className="bg-gray-100">
              <th
                className="sticky left-0 z-10 bg-gray-100 text-left px-3 py-2 font-semibold text-gray-700 whitespace-nowrap border-r border-gray-300 min-w-[140px]"
                rowSpan={2}
              >
                Plant
              </th>
              {calendarMonths.map((cm, i) => (
                <th
                  key={`${cm.year}-${cm.month}`}
                  colSpan={4}
                  className={[
                    'text-center px-1 py-1 font-medium text-gray-600 whitespace-nowrap',
                    i === 0 ? '' : cm.isOverflow
                      ? 'border-l-2 border-dashed border-gray-400'
                      : 'border-l border-gray-300',
                  ].join(' ')}
                >
                  {cm.label}
                </th>
              ))}
            </tr>

            {/* Row 2 — part labels (E M L X) */}
            <tr className="bg-gray-50">
              {calendarMonths.map((cm, mi) =>
                PARTS.map((part) => (
                  <th
                    key={`${cm.year}-${cm.month}-${part}`}
                    className={[
                      'text-center py-1 font-normal text-gray-400 w-6',
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
                  {rec.plant.commonName}
                </td>

                {/* Slot cells */}
                {calendarMonths.map((cm, mi) =>
                  PARTS.map((part) => {
                    const type = getWindowTypeAtSlot(rec, cm.month, cm.year, part);
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
                          type ? WINDOW_COLOURS[type] : 'bg-transparent',
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
