import type { ClimateSummary } from '../types';
import type { MonthlyClimateNormals } from '../services/weatherService';

const FROST_THRESHOLD_C = 0;
const MS_PER_DAY = 86_400_000;

/**
 * Derives accurate frost dates by scanning every daily min-temperature record.
 *
 * Strategy:
 *   - Spring window (NH: Jan 1 – Jun 30): find the LATEST sub-zero day per year,
 *     then average the day-of-year across years → last spring frost.
 *   - Autumn window (NH: Jul 1 – Dec 31): find the EARLIEST sub-zero day per year,
 *     then average the day-of-year across years → first autumn frost.
 *   - Averaging across years smooths out anomalous years.
 *   - Returns dates anchored to the current calendar year.
 *
 * Returns null for each date if no sub-zero days found in that window
 * (i.e. frost-free location).
 */
function deriveFrostDates(
  frostDays: { date: string; minTempC: number }[],
  hemisphereIsNorth: boolean,
  targetYear: number,
): { lastFrostDate: Date | null; firstAutumnFrostDate: Date | null } {
  // Day-of-year helper (0-indexed)
  function dayOfYear(d: Date): number {
    const start = Date.UTC(d.getUTCFullYear(), 0, 0);
    return Math.floor((d.getTime() - start) / MS_PER_DAY);
  }

  // Parse all frost candidate days into structured records
  const records = frostDays
    .filter((r) => r.minTempC < FROST_THRESHOLD_C)
    .map((r) => {
      const d = new Date(r.date + 'T00:00:00Z');
      return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), doy: dayOfYear(d) };
    });

  // Northern hemisphere: spring = months 0–5 (Jan–Jun), autumn = months 6–11 (Jul–Dec)
  // Southern hemisphere: spring = months 6–11 (Jul–Dec), autumn = months 0–5 (Jan–Jun)
  const springMonthRange = hemisphereIsNorth ? [0, 5] : [6, 11];
  const autumnMonthRange = hemisphereIsNorth ? [6, 11] : [0, 5];

  function inRange(month: number, range: [number, number]): boolean {
    return month >= range[0] && month <= range[1];
  }

  // Group sub-zero days in the spring window by year → pick LATEST per year
  const springByYear = new Map<number, number>(); // year → latest doy
  for (const r of records) {
    if (inRange(r.month, springMonthRange as [number, number])) {
      const prev = springByYear.get(r.year) ?? -Infinity;
      if (r.doy > prev) springByYear.set(r.year, r.doy);
    }
  }

  // Group sub-zero days in the autumn window by year → pick EARLIEST per year
  const autumnByYear = new Map<number, number>(); // year → earliest doy
  for (const r of records) {
    if (inRange(r.month, autumnMonthRange as [number, number])) {
      const prev = autumnByYear.get(r.year) ?? Infinity;
      if (r.doy < prev) autumnByYear.set(r.year, r.doy);
    }
  }

  // Average day-of-year across years and convert to a Date in targetYear
  function avgDoyToDate(byYear: Map<number, number>): Date | null {
    if (byYear.size === 0) return null;
    const values = [...byYear.values()];
    const avgDoy = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    // Build date from day-of-year in targetYear
    const d = new Date(Date.UTC(targetYear, 0, 1));
    d.setUTCDate(d.getUTCDate() + avgDoy - 1);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  return {
    lastFrostDate: avgDoyToDate(springByYear),
    firstAutumnFrostDate: avgDoyToDate(autumnByYear),
  };
}

/**
 * Fallback: derive frost dates from monthly average minimums when no daily data available.
 * Coarser than the daily approach — uses the 15th of the month as a representative date.
 */
function deriveFrostDatesFromMonthly(
  avgMinTempC: number[],
  hemisphereIsNorth: boolean,
  targetYear: number,
): { lastFrostDate: Date | null; firstAutumnFrostDate: Date | null } {
  const springMonths = hemisphereIsNorth ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const autumnMonths = hemisphereIsNorth ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];

  let lastFrostDate: Date | null = null;
  let firstAutumnFrostDate: Date | null = null;

  for (let i = springMonths.length - 1; i >= 0; i--) {
    if (avgMinTempC[springMonths[i]] <= FROST_THRESHOLD_C) {
      lastFrostDate = new Date(targetYear, springMonths[i], 15);
      break;
    }
  }
  for (const m of autumnMonths) {
    if (avgMinTempC[m] <= FROST_THRESHOLD_C) {
      firstAutumnFrostDate = new Date(targetYear, m, 15);
      break;
    }
  }

  return { lastFrostDate, firstAutumnFrostDate };
}

/**
 * Interprets Open-Meteo climate normals into a ClimateSummary.
 * Uses daily frost-day scanning when available for precise frost dates;
 * falls back to monthly-average heuristic otherwise.
 */
export function interpretClimate(
  lat: number,
  lon: number,
  normals: MonthlyClimateNormals
): ClimateSummary {
  const hemisphereIsNorth = lat >= 0;
  const { avgMinTempC, avgMeanTempC, frostDays } = normals;
  const targetYear = new Date().getFullYear();

  // Prefer the accurate daily approach; fall back to coarse monthly heuristic
  const { lastFrostDate, firstAutumnFrostDate } =
    frostDays && frostDays.length > 0
      ? deriveFrostDates(frostDays, hemisphereIsNorth, targetYear)
      : deriveFrostDatesFromMonthly(avgMinTempC, hemisphereIsNorth, targetYear);

  let growingSeasonDays = 365; // frost-free default: full year
  if (lastFrostDate && firstAutumnFrostDate) {
    const ms = firstAutumnFrostDate.getTime() - lastFrostDate.getTime();
    growingSeasonDays = Math.max(0, Math.round(ms / MS_PER_DAY));
  } else if (lastFrostDate && !firstAutumnFrostDate) {
    // Spring frost but no autumn frost — warm climate, generous estimate
    growingSeasonDays = 240;
  }

  // Summer = months 5–7 (N) or 11,0,1 (S)
  const summerMonths = hemisphereIsNorth ? [5, 6, 7] : [11, 0, 1];
  const avgSummerTempC =
    summerMonths.reduce((acc, m) => acc + avgMeanTempC[m], 0) / summerMonths.length;

  // Spring = months 2–4 (N) or 8–10 (S)
  const springMonths = hemisphereIsNorth ? [2, 3, 4] : [8, 9, 10];
  const avgSpringTempC =
    springMonths.reduce((acc, m) => acc + avgMeanTempC[m], 0) / springMonths.length;

  return {
    lat,
    lon,
    lastFrostDate,
    firstAutumnFrostDate,
    growingSeasonDays,
    avgSummerTempC: parseFloat(avgSummerTempC.toFixed(1)),
    avgSpringTempC: parseFloat(avgSpringTempC.toFixed(1)),
    hemisphereIsNorth,
  };
}
