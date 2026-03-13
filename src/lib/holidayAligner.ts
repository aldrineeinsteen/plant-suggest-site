import type { PlantRecommendation, CountryHolidays, HolidayHighlight, WindowType, PlanningWindow } from '../types';
import { monthWindowMidpoint } from './monthWindowFormatter';

const MS_PER_DAY = 86_400_000;
const BEST_THRESHOLD_DAYS = 1;
const GOOD_THRESHOLD_DAYS = 3;

function daysDiff(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / MS_PER_DAY;
}

type WindowEntry = { type: WindowType; window: PlanningWindow };

function getWindows(rec: PlantRecommendation): WindowEntry[] {
  const entries: WindowEntry[] = [];
  if (rec.indoorSeedStartWindow)
    entries.push({ type: 'indoorSeedStart', window: rec.indoorSeedStartWindow });
  if (rec.directSowWindow)
    entries.push({ type: 'directSow', window: rec.directSowWindow });
  if (rec.transplantWindow)
    entries.push({ type: 'transplant', window: rec.transplantWindow });
  if (rec.firstHarvestWindow)
    entries.push({ type: 'firstHarvest', window: rec.firstHarvestWindow });
  if (rec.harvestWindow)
    entries.push({ type: 'harvest', window: rec.harvestWindow });
  return entries;
}

/**
 * Attaches HolidayHighlight metadata to each PlantRecommendation.
 * Never modifies any planning window — purely additive.
 * Returns recommendations unchanged if countryHolidays is null.
 */
export function alignHolidays(
  recommendations: PlantRecommendation[],
  countryHolidays: CountryHolidays | null
): PlantRecommendation[] {
  if (!countryHolidays || countryHolidays.holidays.length === 0) {
    return recommendations;
  }

  const holidayDates = countryHolidays.holidays.map((h) => ({
    entry: h,
    date: new Date(h.date),
  }));

  return recommendations.map((rec) => {
    const highlights: HolidayHighlight[] = [];
    const windows = getWindows(rec);

    for (const { type, window } of windows) {
      // Use start window midpoint for comparison
      const midpoint = monthWindowMidpoint(window.start);

      for (const { entry, date } of holidayDates) {
        const delta = daysDiff(midpoint, date);
        if (delta <= BEST_THRESHOLD_DAYS) {
          highlights.push({ holiday: entry, windowType: type, quality: 'best' });
        } else if (delta <= GOOD_THRESHOLD_DAYS) {
          highlights.push({ holiday: entry, windowType: type, quality: 'good' });
        }
      }
    }

    // Sort: best first
    highlights.sort((a, b) => (a.quality === 'best' ? -1 : b.quality === 'best' ? 1 : 0));

    return { ...rec, holidayHighlights: highlights };
  });
}
