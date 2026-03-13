/**
 * Monthly climate normals derived from historical daily data.
 * Index 0 = January, index 11 = December.
 */
export interface MonthlyClimateNormals {
  avgMinTempC: number[];
  avgMaxTempC: number[];
  avgMeanTempC: number[];
}

interface OpenMeteoArchiveResponse {
  daily: {
    time: string[];
    temperature_2m_mean: (number | null)[];
    temperature_2m_min: (number | null)[];
    temperature_2m_max: (number | null)[];
  };
}

/**
 * Fetches historical daily weather from Open-Meteo's archive API for a
 * representative 3-year window, then aggregates into 12 monthly averages.
 * No API key required.
 */
export async function fetchClimateNormals(
  lat: number,
  lon: number
): Promise<MonthlyClimateNormals | null> {
  // Use a recent 3-year window for representative climate data
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start_date: '2021-01-01',
    end_date: '2023-12-31',
    daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean',
    timezone: 'auto',
  });

  const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data: OpenMeteoArchiveResponse = await response.json();
    if (!data.daily?.time) return null;

    const { time, temperature_2m_min, temperature_2m_max, temperature_2m_mean } = data.daily;

    // Accumulate daily values into monthly buckets (0-based month index)
    const minSum = new Array(12).fill(0);
    const maxSum = new Array(12).fill(0);
    const meanSum = new Array(12).fill(0);
    const count = new Array(12).fill(0);

    for (let i = 0; i < time.length; i++) {
      const month = new Date(time[i]).getUTCMonth();
      const minV = temperature_2m_min[i];
      const maxV = temperature_2m_max[i];
      const meanV = temperature_2m_mean[i];
      if (minV != null && maxV != null && meanV != null) {
        minSum[month] += minV;
        maxSum[month] += maxV;
        meanSum[month] += meanV;
        count[month]++;
      }
    }

    const avg = (sum: number, n: number) =>
      n > 0 ? parseFloat((sum / n).toFixed(1)) : 0;

    return {
      avgMinTempC: minSum.map((s, m) => avg(s, count[m])),
      avgMaxTempC: maxSum.map((s, m) => avg(s, count[m])),
      avgMeanTempC: meanSum.map((s, m) => avg(s, count[m])),
    };
  } catch {
    return null;
  }
}
