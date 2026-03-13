export interface ClimateSummary {
  lat: number;
  lon: number;
  /** Estimated last spring frost date, or null if frost-free location */
  lastFrostDate: Date | null;
  /** Estimated first autumn frost date, or null if frost-free location */
  firstAutumnFrostDate: Date | null;
  /** Days between last frost and first autumn frost (0 if frost-free = full year) */
  growingSeasonDays: number;
  avgSummerTempC: number;
  avgSpringTempC: number;
  hemisphereIsNorth: boolean;
}
