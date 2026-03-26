const INCHEON_API_KEY = process.env.INCHEON_AIRPORT_API_KEY!;
const BASE_URL = 'https://api.odcloud.kr/api';

const CACHE = new Map<string, { data: unknown; expiry: number }>();

async function fetchWithCache<T = unknown>(
  url: string,
  ttlMs: number,
): Promise<T> {
  const cached = CACHE.get(url);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Infuser ${INCHEON_API_KEY}`,
    },
  });

  if (!res.ok) {
    // If fetch fails but we have stale cache, return it
    if (cached) {
      return cached.data as T;
    }
    throw new Error(`Incheon API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  CACHE.set(url, { data, expiry: Date.now() + ttlMs });
  return data as T;
}

const TTL = {
  WEATHER: 30 * 60 * 1000,
  PASSENGER_FORECAST: 10 * 60 * 1000,
  CONGESTION: 5 * 60 * 1000,
  AIR_QUALITY: 30 * 60 * 1000,
  FLIGHT_STATUS: 5 * 60 * 1000,
} as const;

export async function getWeather() {
  const url = `${BASE_URL}/15095529/v1/uddi:17662e2f-5e62-44e1-ad1c-3e3e57e60414?serviceKey=${INCHEON_API_KEY}`;
  return fetchWithCache(url, TTL.WEATHER);
}

export async function getPassengerForecast(date?: string) {
  const params = new URLSearchParams();
  if (date) params.set('cond[date::EQ]', date);
  const url = `${BASE_URL}/15095529/v1/uddi:e9f9a3f1-3a4e-4d2a-8b5c-6c7d8e9f0a1b?serviceKey=${INCHEON_API_KEY}&${params.toString()}`;
  return fetchWithCache(url, TTL.PASSENGER_FORECAST);
}

export async function getCongestion(terminal?: string) {
  const params = new URLSearchParams();
  if (terminal) params.set('cond[terminal::EQ]', terminal);
  const url = `${BASE_URL}/15095529/v1/uddi:72e93440-b949-4e72-a3b3-832e39ed062c?serviceKey=${INCHEON_API_KEY}&${params.toString()}`;
  return fetchWithCache(url, TTL.CONGESTION);
}

export async function getOutdoorAirQuality() {
  const url = `${BASE_URL}/15095529/v1/uddi:a2b3c4d5-e6f7-8901-2345-6789abcdef01?serviceKey=${INCHEON_API_KEY}`;
  return fetchWithCache(url, TTL.AIR_QUALITY);
}

export async function getFlightStatus(flightNumber?: string) {
  const params = new URLSearchParams();
  if (flightNumber) params.set('cond[flightId::EQ]', flightNumber);
  const url = `${BASE_URL}/15095529/v1/uddi:f1e2d3c4-b5a6-9876-5432-1fedcba98765?serviceKey=${INCHEON_API_KEY}&${params.toString()}`;
  return fetchWithCache(url, TTL.FLIGHT_STATUS);
}
