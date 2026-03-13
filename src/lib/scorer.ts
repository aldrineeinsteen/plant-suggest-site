import type { PlantRecommendation, GrowingSetup, ClimateSummary } from '../types';

/**
 * Calculates a recommendation score for each plant.
 * Higher = better suited to this location and setup.
 * Scores are purely relative — used for display ordering only.
 */
export function scoreRecommendation(
  rec: PlantRecommendation,
  climate: ClimateSummary,
  setup: GrowingSetup,
  allResultIds: Set<string>
): number {
  let score = 100;
  const { plant, warnings } = rec;

  // Short season warning
  if (warnings.some((w) => w.includes('Season may be too short'))) {
    score -= setup.hasGreenhouse ? 5 : 20;
  }

  // Germination temperature vs spring climate
  const springTempDelta = Math.abs(climate.avgSpringTempC - plant.germinationTempMinC);
  if (springTempDelta > 10) score -= 10;
  if (springTempDelta > 20) score -= 5;

  // Harvest overrun
  if (warnings.some((w) => w.includes('extends beyond'))) {
    score -= 10;
  }

  // Companion plants are also in the result set — positive social signal
  const companionBonus = plant.companionPlantIds.filter((id) => allResultIds.has(id)).length;
  score += companionBonus * 5;

  // Bonus: well within season
  if (climate.growingSeasonDays > plant.daysToFirstHarvest + plant.harvestDurationDays + 14) {
    score += 10;
  }

  // Minor deduction: plant is directSowOnly but user has a propagator (slight mismatch of expectation)
  if (plant.directSowOnly && setup.hasHeatedPropagator) {
    score -= 5;
  }

  return Math.max(0, score);
}
