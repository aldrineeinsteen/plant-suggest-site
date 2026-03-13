import type { ClimateSummary } from '../types';
import type { MonthlyClimateNormals } from '../services/weatherService';

const FROST_THRESHOLD_C = 0;
// Months where we look for last spring frost (Jan=0 … Jun=5)
const SPRING_MONTHS = [0, 1, 2, 3, 4, 5];
// Months where we look for first autumn frost (Jul=6 … Dec=11)
const AUTUMN_MONTHS = [6, 7, 8, 9, 10, 11];
// Representative year for date calculations
const YEAR = new Date().getFullYear();

/**
 * Returns the representative midpoint date of a calendar month (15th).
 */
function midOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex, 15);
}

/**
 * Interprets Open-Meteo monthly climate normals into a ClimateSummary.
 * Uses transparent heuristics that can be adjusted via constants above.
 */
export function interpretClimate(
  lat: number,
  lon: number,
  normals: MonthlyClimateNormals
): ClimateSummary {
  const hemisphereIsNorth = lat >= 0;
  const { avgMinTempC, avgMeanTempC } = normals;

  let lastFrostDate: Date | null = null;
  let firstAutumnFrostDate: Date | null = null;

  if (hemisphereIsNorth) {
    // Last spring month with avg_min below frost threshold
    for (let m = SPRING_MONTHS[SPRING_MONTHS.length - 1]; m >= SPRING_MONTHS[0]; m--) {
      if (avgMinTempC[m] <= FROST_THRESHOLD_C) {
        lastFrostDate = midOfMonth(YEAR, m);
        break;
      }
    }
    // First autumn month with avg_min below frost threshold
    for (const m of AUTUMN_MONTHS) {
      if (avgMinTempC[m] <= FROST_THRESHOLD_C) {
        firstAutumnFrostDate = midOfMonth(YEAR, m);
        break;
      }
    }
  } else {
    // Southern hemisphere — spring is Jul–Dec, autumn is Jan–Jun
    const shSpringMonths = [6, 7, 8, 9, 10, 11];
    const shAutumnMonths = [0, 1, 2, 3, 4, 5];

    for (let m = shSpringMonths[shSpringMonths.length - 1]; m >= shSpringMonths[0]; m--) {
      if (avgMinTempC[m] <= FROST_THRESHOLD_C) {
        lastFrostDate = midOfMonth(YEAR, m);
        break;
      }
    }
    for (const m of shAutumnMonths) {
      if (avgMinTempC[m] <= FROST_THRESHOLD_C) {
        firstAutumnFrostDate = midOfMonth(YEAR, m);
        break;
      }
    }
  }

  let growingSeasonDays = 365; // frost-free: full year
  if (lastFrostDate && firstAutumnFrostDate) {
    const ms = firstAutumnFrostDate.getTime() - lastFrostDate.getTime();
    growingSeasonDays = Math.max(0, Math.round(ms / 86_400_000));
  } else if (lastFrostDate && !firstAutumnFrostDate) {
    // Spring frost but no autumn frost — warm climate, estimate season to end of year
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
