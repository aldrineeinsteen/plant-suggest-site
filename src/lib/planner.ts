import type { PlantDefinition, PlantRecommendation, GrowingSetup, ClimateSummary, PlanningWindow } from '../types';
import { dateRangeToWindow } from './monthWindowFormatter';

const MS_PER_DAY = 86_400_000;
const WEEK_MS = 7 * MS_PER_DAY;

function addWeeks(date: Date, weeks: number): Date {
  return new Date(date.getTime() + weeks * WEEK_MS);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Builds the effective last frost date, adjusted for growing setup.
 */
function adjustedLastFrost(climate: ClimateSummary, setup: GrowingSetup): Date {
  // Fall back to mid-April if no frost data (frost-free location)
  const base = climate.lastFrostDate ?? new Date(new Date().getFullYear(), 3, 15);
  let shift = 0;
  if (setup.hasGreenhouse) shift -= 21;       // 3 weeks earlier
  if (setup.hasHeatedPropagator) shift -= 14; // 2 weeks earlier start capability
  if (setup.hasColdFrame) shift -= 10;        // 10 days
  return addDays(base, shift);
}

/**
 * Effective season end, adjusted for greenhouse.
 */
function adjustedSeasonEnd(climate: ClimateSummary, setup: GrowingSetup): Date {
  const base =
    climate.firstAutumnFrostDate ??
    new Date(new Date().getFullYear(), 9, 31); // Oct 31 default
  const shift = setup.hasGreenhouse ? 28 : 0; // 4 weeks later
  return addDays(base, shift);
}

/** Short-range planning window from two dates. */
function window(start: Date, end: Date): PlanningWindow {
  // Ensure end >= start
  const safeEnd = end > start ? end : addDays(start, 14);
  return dateRangeToWindow(start, safeEnd);
}

/**
 * Runs the full planning engine for a set of plants.
 */
export function runPlanner(
  plants: PlantDefinition[],
  climate: ClimateSummary,
  setup: GrowingSetup
): Omit<PlantRecommendation, 'companionPlants' | 'plantsToAvoid' | 'holidayHighlights'>[] {
  const frost = adjustedLastFrost(climate, setup);
  const seasonEnd = adjustedSeasonEnd(climate, setup);
  const effectiveSeasonDays = Math.max(
    0,
    Math.round((seasonEnd.getTime() - frost.getTime()) / MS_PER_DAY)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return plants
    .map((plant): Omit<PlantRecommendation, 'companionPlants' | 'plantsToAvoid' | 'holidayHighlights'> | null => {
      const warnings: string[] = [];

      // Filter: propagator required but unavailable
      if (plant.propagatorBenefit === 'required' && !setup.hasHeatedPropagator) {
        return null;
      }

      // ── Year rollover: if the sowing window has already passed, shift to next year ──
      const earliestActionableEnd = plant.directSowOnly
        ? addWeeks(frost, plant.sowingOffsetWeeks.max)
        : addWeeks(frost, plant.indoorStartOffsetWeeks.max);
      const isNextSeason = earliestActionableEnd < today;
      const effectiveFrost = isNextSeason ? addDays(frost, 365) : frost;
      const effectiveSeasonEnd = isNextSeason ? addDays(seasonEnd, 365) : seasonEnd;

      // Germination temperature check
      const springTooWarm = climate.avgSpringTempC > plant.germinationTempMaxC + 5;
      if (springTooWarm) {
        warnings.push(`Spring temperatures may be too warm for germination.`);
      }

      // Season length check
      const tooShort = plant.daysToFirstHarvest > effectiveSeasonDays;
      if (tooShort) {
        if (!setup.hasGreenhouse) {
          warnings.push(`Season may be too short for a full harvest without a greenhouse.`);
        }
      }

      // ── Timing calculations ──

      // Indoor seed start
      const indoorStartWindow =
        !plant.directSowOnly
          ? window(
              addWeeks(effectiveFrost, plant.indoorStartOffsetWeeks.min),
              addWeeks(effectiveFrost, plant.indoorStartOffsetWeeks.max)
            )
          : undefined;

      // Transplant
      const transplantDate = addWeeks(effectiveFrost, plant.transplantOffsetWeeks.min);
      const transplantWindow =
        !plant.directSowOnly
          ? window(
              transplantDate,
              addWeeks(effectiveFrost, plant.transplantOffsetWeeks.max)
            )
          : undefined;

      // Direct sow
      const directSowStart = addWeeks(effectiveFrost, plant.sowingOffsetWeeks.min);
      const directSowWindow = window(
        directSowStart,
        addWeeks(effectiveFrost, plant.sowingOffsetWeeks.max)
      );

      // Harvest timing (based on transplant if transplanted, else direct sow start)
      const growthBase = !plant.directSowOnly ? transplantDate : directSowStart;
      const firstHarvestDate = addDays(growthBase, plant.daysToFirstHarvest);
      const harvestEndDate = addDays(firstHarvestDate, plant.harvestDurationDays);

      const firstHarvestWindow = window(firstHarvestDate, addDays(firstHarvestDate, 14));
      const harvestWindow = window(firstHarvestDate, harvestEndDate);

      // Clamp: warn if harvest extends past season end
      if (harvestEndDate > effectiveSeasonEnd) {
        warnings.push(`Harvest window extends beyond expected season end.`);
      }

      return {
        plant,
        score: 0, // scored separately
        indoorSeedStartWindow: indoorStartWindow,
        directSowWindow,
        transplantWindow,
        firstHarvestWindow,
        harvestWindow,
        warnings,
        isNextSeason,
      };
    })
    .filter((r): r is Omit<PlantRecommendation, 'companionPlants' | 'plantsToAvoid' | 'holidayHighlights'> => r !== null);
}
