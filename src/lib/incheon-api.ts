const INCHEON_API_KEY = process.env.INCHEON_AIRPORT_API_KEY!;
const BASE_URL = 'https://api.odcloud.kr/api';
const FLIGHT_STATUS_URL = 'https://apis.data.go.kr/B551177/statusOfAllFltDeOdp/getStatusOfAllFltDeOdp';

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
  FLIGHT_AIRCRAFT: 24 * 60 * 60 * 1000,
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

/**
 * 인천공항 운항 현황 API에서 항공기 기종을 조회합니다.
 * @param flightNumber 항공편 번호 (예: "KE701")
 * @param departureDate 출발일 (YYYY-MM-DD 형식)
 * @returns 항공기 기종 코드 (예: "B777-300ER") 또는 null
 */
export async function getFlightAircraftType(
  flightNumber: string,
  departureDate: string,
): Promise<string | null> {
  try {
    const fromTime = departureDate.replace(/-/g, '');

    const params = new URLSearchParams({
      serviceKey: INCHEON_API_KEY,
      flight_id: flightNumber,
      from_time: fromTime,
      lang: 'K',
      type: 'json',
    });

    const cacheKey = `flight_aircraft_${flightNumber}_${fromTime}`;
    const cached = CACHE.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as string | null;
    }

    const url = `${FLIGHT_STATUS_URL}?${params.toString()}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[getFlightAircraftType] API 응답 오류: ${res.status}`);
      if (cached) return cached.data as string | null;
      return null;
    }

    const data = await res.json();

    const items =
      data?.response?.body?.items ??
      data?.body?.items ??
      data?.items ??
      [];

    const itemList = Array.isArray(items) ? items : items?.item ? (Array.isArray(items.item) ? items.item : [items.item]) : [];

    if (itemList.length === 0) {
      CACHE.set(cacheKey, { data: null, expiry: Date.now() + TTL.FLIGHT_AIRCRAFT });
      return null;
    }

    const flight = itemList[0];
    const rawAircraft =
      flight.aircraft ??
      flight.aircraftCode ??
      flight.codeshare ??
      flight.airFln ??
      flight.IO ??
      null;

    if (!rawAircraft || typeof rawAircraft !== 'string') {
      CACHE.set(cacheKey, { data: null, expiry: Date.now() + TTL.FLIGHT_AIRCRAFT });
      return null;
    }

    const aircraftType = normalizeAircraftType(rawAircraft);
    CACHE.set(cacheKey, { data: aircraftType, expiry: Date.now() + TTL.FLIGHT_AIRCRAFT });
    return aircraftType;
  } catch (error) {
    console.warn('[getFlightAircraftType] 항공기 기종 조회 실패:', error);
    return null;
  }
}

/**
 * API 응답의 기종 코드를 표준 형식으로 정규화합니다.
 */
function normalizeAircraftType(raw: string): string {
  const normalized = raw.trim().toUpperCase();

  const mapping: Record<string, string> = {
    '773': 'B777-300ER',
    '77W': 'B777-300ER',
    'B773': 'B777-300ER',
    'B77W': 'B777-300ER',
    'B777': 'B777-300ER',
    '388': 'A380-800',
    'A388': 'A380-800',
    'A380': 'A380-800',
    '789': 'B787-9',
    'B789': 'B787-9',
    'B787': 'B787-9',
    '333': 'A330-300',
    'A333': 'A330-300',
    'A330': 'A330-300',
    '738': 'B737-800',
    'B738': 'B737-800',
    'B737': 'B737-800',
    '32N': 'A321neo',
    'A32N': 'A321neo',
    'A321': 'A321neo',
    '321': 'A321neo',
  };

  if (mapping[normalized]) return mapping[normalized];

  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key)) return value;
  }

  return raw.trim();
}
