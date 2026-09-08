export const AVIA_PROVIDER = (process.env.EXPO_PUBLIC_SKYTRACK_PROVIDER ?? 'airlabs') as
  | 'airlabs'
  | 'aviationstack'
  | 'simulated';

export const AVIA_KEY = process.env.EXPO_PUBLIC_SKYTRACK_API_KEY ?? '';

export const AVIA_DISPLAY = AVIA_KEY.trim()
  ? AVIA_PROVIDER === 'aviationstack'
    ? 'AVIATIONSTACK V1'
    : 'AIRLABS V9'
  : 'SIMULATED FEED';

export type LiveFlight = {
  hex: string;
  callsign: string;
  airlineIcao: string;
  flag: string;
  lat: number;
  lng: number;
  altFt: number;
  speedKt: number;
  vsFpm: number;
  heading: number;
  squawk: string;
  dep: string;
  arr: string;
  reg: string;
  aircraftIcao: string;
  status: 'airborne' | 'ground';
  updated: number;
};

const KMH_TO_KT = 0.539957;
const M_TO_FT = 3.28084;
const MPS_TO_FPM = 196.8504;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type AirLabsFlight = {
  hex?: string;
  reg_number?: string;
  flag?: string;
  lat?: number;
  lng?: number;
  alt?: number;
  dir?: number;
  speed?: number;
  v_speed?: number;
  squawk?: string;
  flight_icao?: string;
  flight_number?: string;
  dep_icao?: string;
  arr_icao?: string;
  airline_icao?: string;
  aircraft_icao?: string;
  status?: string;
  updated?: number;
};

type AStackFlight = {
  flight?: { icaoNumber?: string; iataNumber?: string; number?: string };
  airline?: { icao?: string; iata?: string };
  flight_status?: string;
  live?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    direction?: number;
    speed_horizontal?: number;
    speed_vertical?: number;
    is_ground?: boolean;
    updated?: string;
  };
  aircraft?: { icao?: string; iata?: string };
  departure?: { iata?: string; icao?: string };
  arrival?: { iata?: string; icao?: string };
};

async function fetchJson(url: string, timeoutMs = 12000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

const FIELDS = [
  'hex',
  'reg_number',
  'flag',
  'lat',
  'lng',
  'alt',
  'dir',
  'speed',
  'v_speed',
  'squawk',
  'flight_icao',
  'dep_icao',
  'arr_icao',
  'airline_icao',
  'aircraft_icao',
  'status',
  'updated',
].join(',');

function fromAirLabs(list: AirLabsFlight[]): LiveFlight[] {
  return list
    .filter((f) => typeof f.lat === 'number' && typeof f.lng === 'number')
    .map((f) => {
      const altFt = (f.alt ?? 0) * M_TO_FT;
      const airborne = (f.status ?? 'en-route') === 'en-route';
      return {
        hex: f.hex ?? '',
        callsign: f.flight_icao ?? f.flight_number ?? '----',
        airlineIcao: f.airline_icao ?? '----',
        flag: (f.flag ?? '').toUpperCase() || 'ZZ',
        lat: f.lat ?? 0,
        lng: f.lng ?? 0,
        altFt: Math.round(altFt),
        speedKt: Math.round((f.speed ?? 0) * KMH_TO_KT),
        vsFpm: Math.round((f.v_speed ?? 0) * MPS_TO_FPM),
        heading: Math.round((f.dir ?? 0) % 360),
        squawk: f.squawk ?? '----',
        dep: f.dep_icao ?? '----',
        arr: f.arr_icao ?? '----',
        reg: f.reg_number ?? '----',
        aircraftIcao: f.aircraft_icao ?? '',
        status: airborne ? 'airborne' : 'ground',
        updated: f.updated ?? Date.now() / 1000,
      };
    });
}

function fromAviationstack(data: AStackFlight[]): LiveFlight[] {
  return data
    .filter((f) => typeof f.live?.latitude === 'number' && typeof f.live?.longitude === 'number')
    .map((f) => {
      const live = f.live ?? {};
      const onGround = live.is_ground === true || (f.flight_status ?? '') !== 'active';
      const flag = '';
      return {
        hex: f.aircraft?.icao ?? '',
        callsign: f.flight?.icaoNumber ?? f.flight?.iataNumber ?? f.flight?.number ?? '----',
        airlineIcao: f.airline?.icao ?? f.airline?.iata ?? '----',
        flag,
        lat: live.latitude ?? 0,
        lng: live.longitude ?? 0,
        altFt: Math.round(live.altitude ?? 0),
        speedKt: Math.round((live.speed_horizontal ?? 0) * KMH_TO_KT),
        vsFpm: Math.round((live.speed_vertical ?? 0) * MPS_TO_FPM),
        heading: Math.round((live.direction ?? 0) % 360),
        squawk: '----',
        dep: f.departure?.icao ?? f.departure?.iata ?? '----',
        arr: f.arrival?.icao ?? f.arrival?.iata ?? '----',
        reg: '----',
        aircraftIcao: f.aircraft?.icao ?? f.aircraft?.iata ?? '',
        status: onGround ? 'ground' : 'airborne',
        updated: live.updated ? new Date(live.updated).getTime() / 1000 : Date.now() / 1000,
      };
    });
}

export async function fetchLiveFlights(): Promise<{
  flights: LiveFlight[];
  provider: string;
  latencyMs: number;
  simulated: boolean;
  error: string | null;
}> {
  const key = AVIA_KEY.trim();
  const started = Date.now();

  if (!key) {
    const { generateSimulatedFlights } = await import('@/lib/simulator');
    return {
      flights: generateSimulatedFlights(),
      provider: 'SIMULATED',
      latencyMs: 0,
      simulated: true,
      error: null,
    };
  }

  let flights: LiveFlight[] = [];

  try {
    if (AVIA_PROVIDER === 'aviationstack') {
      const url =
        'https://api.aviationstack.com/v1/flights' +
        `?access_key=${encodeURIComponent(key)}&limit=100&flight_status=active`;
      const jsonData = (await fetchJson(url)) as { data?: AStackFlight[]; error?: { info?: string } };
      if (!Array.isArray(jsonData.data)) {
        const info = jsonData.error?.info ?? 'bad response';
        throw new Error(`Aviationstack: ${info}`);
      }
      flights = fromAviationstack(jsonData.data);
    } else {
      const url =
        'https://airlabs.co/api/v9/flights' +
        `?api_key=${encodeURIComponent(key)}&_fields=${FIELDS}&limit=250`;
      const jsonData = (await fetchJson(url)) as {
        response?: AirLabsFlight[];
        error?: { message?: string };
      };
      if (!Array.isArray(jsonData.response)) {
        const msg = jsonData.error?.message ?? 'bad response';
        throw new Error(`AirLabs: ${msg}`);
      }
      flights = fromAirLabs(jsonData.response);
    }
  } catch (e) {
    const { generateSimulatedFlights } = await import('@/lib/simulator');
    return {
      flights: generateSimulatedFlights(),
      provider: 'SIMULATED',
      latencyMs: Date.now() - started,
      simulated: true,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return {
    flights,
    provider: AVIA_PROVIDER,
    latencyMs: Date.now() - started,
    simulated: false,
    error: null,
  };
}

export function flagEmoji(iso: string): string {
  if (!iso || iso.length !== 2) return '\u{1F30D}';
  const a = iso.toUpperCase().charCodeAt(0) + 127397;
  const b = iso.toUpperCase().charCodeAt(1) + 127397;
  return String.fromCodePoint(a, b);
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  RU: 'Russia',
  TR: 'Turkey',
  IL: 'Israel',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  IN: 'India',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  AU: 'Australia',
  NZ: 'New Zealand',
  BR: 'Brazil',
  AR: 'Argentina',
  CL: 'Chile',
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  IR: 'Iran',
  UA: 'Ukraine',
  NL: 'Netherlands',
  BE: 'Belgium',
  AT: 'Austria',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  DK: 'Denmark',
  PL: 'Poland',
  CZ: 'Czechia',
  PT: 'Portugal',
  GR: 'Greece',
  IE: 'Ireland',
  IS: 'Iceland',
  LU: 'Luxembourg',
  HU: 'Hungary',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  MT: 'Malta',
  CY: 'Cyprus',
  JO: 'Jordan',
  QA: 'Qatar',
  KW: 'Kuwait',
  BH: 'Bahrain',
  OM: 'Oman',
  MA: 'Morocco',
  TN: 'Tunisia',
  DZ: 'Algeria',
  KE: 'Kenya',
  ET: 'Ethiopia',
  GH: 'Ghana',
  CO: 'Colombia',
  PE: 'Peru',
  EC: 'Ecuador',
  VE: 'Venezuela',
  KZ: 'Kazakhstan',
  UZ: 'Uzbekistan',
  GE: 'Georgia',
  AZ: 'Azerbaijan',
  AM: 'Armenia',
};

export function countryName(iso: string): string {
  return COUNTRY_NAMES[iso.toUpperCase()] ?? (iso.length === 2 ? iso.toUpperCase() : 'Unknown');
}

const HEAVY = ['B77', 'B78', 'B74', 'A35', 'A38', 'A33'];

export type Category = 'HEAVY' | 'NARROW' | 'REGIONAL';

export function categorize(aircraftIcao: string): Category {
  const code = (aircraftIcao ?? '').toUpperCase();
  if (!code) return 'REGIONAL';
  if (HEAVY.some((p) => code.startsWith(p))) return 'HEAVY';
  if (
    code.startsWith('A31') ||
    code.startsWith('A32') ||
    code.startsWith('B73') ||
    code.startsWith('B71') ||
    code.startsWith('B75') ||
    code.startsWith('A22') ||
    code.startsWith('A21') ||
    code.startsWith('CRJ') ||
    code.startsWith('E1') ||
    code.startsWith('E2')
  ) {
    return 'NARROW';
  }
  return 'REGIONAL';
}

export function dms(lat: number, lng: number): { lat: string; lon: string } {
  const p = (v: number): string =>
    v < 0 ? 'S' : 'N';
  const h = (v: number): string => {
    const abs = Math.abs(v);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = Math.round(((abs - d) * 60 - m) * 60);
    return `${d}\u00B0${String(m).padStart(2, '0')}\u2019${String(s).padStart(2, '0')}\u201D`;
  };
  return {
    lat: `${h(lat)}${p(lat)}`,
    lon: `${h(lng)}${lng < 0 ? 'W' : 'E'}`,
  };
}

export function progressFromAlt(altFt: number): number {
  if (altFt <= 0) return 8;
  return clamp(Math.round((altFt / 43000) * 100), 6, 96);
}

export function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

export function vspLabel(vsFpm: number): string {
  if (vsFpm > 200) return 'CLIMB EN-ROUTE';
  if (vsFpm < -200) return 'DESCENDING';
  return 'LEVEL EN-ROUTE';
}