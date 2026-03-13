import type { GeoLocation } from '../types';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Geocodes a postcode/ZIP to lat/lon using Nominatim (OpenStreetMap).
 * No API key required. Rate-limited to 1 req/sec by OSM policy.
 */
export async function geocodePostcode(
  postcode: string,
  countryCode: string
): Promise<GeoLocation | null> {
  const params = new URLSearchParams({
    postalcode: postcode.trim(),
    countrycodes: countryCode.toLowerCase(),
    format: 'json',
    limit: '1',
  });

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent to identify the application
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) return null;

    const results: NominatimResult[] = await response.json();
    if (!results || results.length === 0) return null;

    const first = results[0];
    return {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch {
    return null;
  }
}
