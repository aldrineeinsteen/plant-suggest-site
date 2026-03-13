import type { MonthWindow, MonthPart, PlanningWindow } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Maps a day-of-month (1–31) to a MonthPart segment. */
function dayToPart(day: number): MonthPart {
  if (day <= 7) return 1;
  if (day <= 15) return 2;
  if (day <= 23) return 3;
  return 4;
}

function partLabel(part: MonthPart): string {
  switch (part) {
    case 1: return 'Early';
    case 2: return 'Mid';
    case 3: return 'Late';
    case 4: return 'End of';
  }
}

/** Converts a JS Date into a MonthWindow with a human-readable label. */
export function dateToMonthWindow(date: Date): MonthWindow {
  const month = date.getMonth() + 1; // 1-based
  const year = date.getFullYear();
  const day = date.getDate();
  const part = dayToPart(day);
  const monthName = MONTH_NAMES[month - 1];
  const label = `${partLabel(part)} ${monthName}`;
  return { label, part, month, year };
}

/**
 * Converts a date range into a PlanningWindow.
 * If start and end resolve to the same month-part the label is a single value.
 */
export function dateRangeToWindow(start: Date, end: Date): PlanningWindow {
  const startW = dateToMonthWindow(start);
  const endW = dateToMonthWindow(end);

  const label =
    startW.label === endW.label
      ? startW.label
      : `${startW.label} – ${endW.label}`;

  return { start: startW, end: endW, label };
}

/** Returns the representative midpoint Date of a MonthWindow (for comparison logic). */
export function monthWindowMidpoint(w: MonthWindow): Date {
  // part midpoints: 1→4, 2→11, 3→19, 4→27
  const partMidDay: Record<MonthPart, number> = { 1: 4, 2: 11, 3: 19, 4: 27 };
  return new Date(w.year, w.month - 1, partMidDay[w.part]);
}
