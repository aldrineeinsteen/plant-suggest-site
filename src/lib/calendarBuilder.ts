import type { PlantRecommendation, PlanningWindow, WindowType, MonthWindow } from '../types/planning';

export interface CalendarMonth {
  month: number;  // 1–12
  year: number;
  label: string;  // e.g. "Mar 2026"
  isOverflow: boolean;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Build an ordered array of calendar months starting from startMonth/startYear. */
export function buildCalendarMonths(
  startMonth: number,
  startYear: number,
  count: number = 12,
  overflowCount: number = 0,
): CalendarMonth[] {
  const months: CalendarMonth[] = [];
  let m = startMonth;
  let y = startYear;
  for (let i = 0; i < count + overflowCount; i++) {
    months.push({
      month: m,
      year: y,
      label: `${MONTH_SHORT[m - 1]} ${y}`,
      isOverflow: i >= count,
    });
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

/** Convert a MonthWindow slot to a comparable ordinal integer. Higher = later in time. */
function slotOrdinal(year: number, month: number, part: number): number {
  return year * 48 + (month - 1) * 4 + (part - 1);
}

function windowOrdinalStart(w: PlanningWindow): number {
  return slotOrdinal(w.start.year, w.start.month, w.start.part);
}

function windowOrdinalEnd(w: PlanningWindow): number {
  return slotOrdinal(w.end.year, w.end.month, w.end.part);
}

/** Priority order — highest wins when multiple windows overlap a slot. */
const WINDOW_PRIORITY: WindowType[] = ['harvest', 'firstHarvest', 'transplant', 'directSow', 'indoorSeedStart'];

/**
 * Return the WindowType that should be displayed for a given slot, or null if none.
 * Priority: harvest > firstHarvest > transplant > directSow > indoorSeedStart.
 */
export function getWindowTypeAtSlot(
  rec: PlantRecommendation,
  month: number,
  year: number,
  part: number,
): WindowType | null {
  const ord = slotOrdinal(year, month, part);

  const windows: Partial<Record<WindowType, PlanningWindow | undefined>> = {
    harvest: rec.harvestWindow,
    firstHarvest: rec.firstHarvestWindow,
    transplant: rec.transplantWindow,
    directSow: rec.directSowWindow,
    indoorSeedStart: rec.indoorSeedStartWindow,
  };

  for (const type of WINDOW_PRIORITY) {
    const w = windows[type];
    if (w && ord >= windowOrdinalStart(w) && ord <= windowOrdinalEnd(w)) {
      return type;
    }
  }
  return null;
}

/**
 * Determine how many overflow months are needed so that no harvest window is clipped.
 * Returns a number 0–4 (capped).
 */
export function needsOverflowMonths(
  recs: PlantRecommendation[],
  calendarMonths: CalendarMonth[],
): number {
  if (calendarMonths.length === 0) return 0;
  const last = calendarMonths[calendarMonths.length - 1];
  const lastOrd = slotOrdinal(last.year, last.month, 4);

  let maxExtra = 0;
  for (const rec of recs) {
    const w = rec.harvestWindow ?? rec.firstHarvestWindow;
    if (!w) continue;
    const endOrd = windowOrdinalEnd(w);
    if (endOrd > lastOrd) {
      // Each month = 4 ordinal units
      const extra = Math.ceil((endOrd - lastOrd) / 4);
      if (extra > maxExtra) maxExtra = extra;
    }
  }
  return Math.min(maxExtra, 4);
}

/** Convert a MonthWindow part number to its display label. */
export function partLabel(part: MonthWindow['part']): string {
  return part === 1 ? 'E' : part === 2 ? 'M' : part === 3 ? 'L' : 'X';
}
