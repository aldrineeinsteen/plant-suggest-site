import type { CountryHolidays } from '../types';

const cache = new Map<string, CountryHolidays | null>();

/**
 * Loads holiday data for a given ISO 3166-1 alpha-2 country code.
 * Returns null (with no error thrown) if the country file doesn't exist.
 */
export async function loadHolidays(countryCode: string): Promise<CountryHolidays | null> {
  const key = countryCode.toUpperCase();
  if (cache.has(key)) return cache.get(key)!;

  const base = import.meta.env.BASE_URL;
  try {
    const response = await fetch(`${base}data/holidays/${key}.json`);
    if (!response.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await response.json()) as CountryHolidays;
    cache.set(key, data);
    return data;
  } catch {
    cache.set(key, null);
    return null;
  }
}
