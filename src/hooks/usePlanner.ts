import { useState } from 'react';
import type { LocationInput, GrowingSetup, PlannerResult, PlantRecommendation } from '../types';

const STORAGE_KEY = 'plant-suggest-result';

function saveResult(result: PlannerResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Quota exceeded or storage unavailable — silently skip
  }
}

function loadSavedResult(): PlannerResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlannerResult;
    // Revive generatedAt — JSON serialisation strips the Date prototype
    parsed.generatedAt = new Date(parsed.generatedAt);
    return parsed;
  } catch {
    return null;
  }
}
import { geocodePostcode } from '../services/geocodingService';
import { fetchClimateNormals } from '../services/weatherService';
import { loadAllPlants, findPlantById } from '../services/plantDataLoader';
import { loadHolidays } from '../services/holidayLoader';
import { interpretClimate } from '../lib/climateInterpreter';
import { runPlanner } from '../lib/planner';
import { scoreRecommendation } from '../lib/scorer';
import { alignHolidays } from '../lib/holidayAligner';

type Status = 'idle' | 'geocoding' | 'weather' | 'planning' | 'done' | 'error';

interface UsePlannerReturn {
  status: Status;
  statusLabel: string;
  result: PlannerResult | null;
  errorMessage: string | null;
  run: (location: LocationInput, setup: GrowingSetup) => Promise<void>;
  reset: () => void;
}

const STATUS_LABELS: Record<Status, string> = {
  idle: '',
  geocoding: 'Looking up your location…',
  weather: 'Fetching climate data…',
  planning: 'Finding the best plants for you…',
  done: '',
  error: '',
};

export function usePlanner(): UsePlannerReturn {
  const [status, setStatus] = useState<Status>(() => (loadSavedResult() ? 'done' : 'idle'));
  const [result, setResult] = useState<PlannerResult | null>(() => loadSavedResult());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function run(locationInput: LocationInput, setup: GrowingSetup) {
    setResult(null);
    setErrorMessage(null);

    // Step 1: Geocode
    setStatus('geocoding');
    const geoLocation = await geocodePostcode(locationInput.postcode, locationInput.country);
    if (!geoLocation) {
      setStatus('error');
      setErrorMessage(
        `Could not find "${locationInput.postcode}" in ${locationInput.country}. Please check your postcode and try again.`
      );
      return;
    }

    // Step 2: Climate
    setStatus('weather');
    const [normals, plants, holidays] = await Promise.all([
      fetchClimateNormals(geoLocation.lat, geoLocation.lon),
      loadAllPlants(),
      loadHolidays(locationInput.country),
    ]);

    if (!normals) {
      setStatus('error');
      setErrorMessage('Could not retrieve climate data. Please try again in a moment.');
      return;
    }

    // Step 3: Plan
    setStatus('planning');
    const climate = interpretClimate(geoLocation.lat, geoLocation.lon, normals);
    const rawRecs = runPlanner(plants, climate, setup);

    // Resolve companion and avoid references
    const resultIds = new Set(rawRecs.map((r) => r.plant.id));

    const recommendations: PlantRecommendation[] = rawRecs.map((rec) => {
      const companionPlants = rec.plant.companionPlantIds
        .map((id) => findPlantById(plants, id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

      const plantsToAvoid = rec.plant.avoidNearIds
        .map((id) => findPlantById(plants, id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

      const score = scoreRecommendation(
        { ...rec, companionPlants, plantsToAvoid, holidayHighlights: [] },
        climate,
        setup,
        resultIds
      );

      return { ...rec, companionPlants, plantsToAvoid, score, holidayHighlights: [] };
    });

    // Sort by score descending before holiday alignment
    recommendations.sort((a, b) => b.score - a.score);

    // Step 4: Holiday alignment (additive metadata only)
    const aligned = alignHolidays(recommendations, holidays);

    const plannerResult: PlannerResult = {
      location: geoLocation,
      climate,
      setup,
      recommendations: aligned,
      generatedAt: new Date(),
    };
    saveResult(plannerResult);
    setResult(plannerResult);
    setStatus('done');
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setStatus('idle');
    setResult(null);
    setErrorMessage(null);
  }

  return {
    status,
    statusLabel: STATUS_LABELS[status],
    result,
    errorMessage,
    run,
    reset,
  };
}
