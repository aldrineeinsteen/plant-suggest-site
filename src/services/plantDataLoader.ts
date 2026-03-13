import type { PlantDefinition } from '../types';

const PLANT_CATEGORIES = ['vegetables', 'herbs', 'fruits', 'flowers'] as const;
let cache: PlantDefinition[] | null = null;

/**
 * Loads all plant definition JSON files from /data/plants/.
 * Results are cached for the session lifetime.
 */
export async function loadAllPlants(): Promise<PlantDefinition[]> {
  if (cache) return cache;

  const base = import.meta.env.BASE_URL;
  const fetches = PLANT_CATEGORIES.map((cat) =>
    fetch(`${base}data/plants/${cat}.json`)
      .then((r) => {
        if (!r.ok) return [] as PlantDefinition[];
        return r.json() as Promise<PlantDefinition[]>;
      })
      .catch(() => [] as PlantDefinition[])
  );

  const results = await Promise.all(fetches);
  cache = results.flat();
  return cache;
}

/** Returns a single plant by id, or undefined if not found. */
export function findPlantById(plants: PlantDefinition[], id: string): PlantDefinition | undefined {
  return plants.find((p) => p.id === id);
}
