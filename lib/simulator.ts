import type { LiveFlight } from '@/lib/aviation';

type Airport = {
  icao: string;
  iata: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
};

type Airline = {
  icao: string;
  iata: string;
  callsign: string;
  flag: string;
  fleet: string[];
};

export const AIRPORTS: Airport[] = [
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles Intl', lat: 33.9425, lng: -118.4081, country: 'US' },
  { icao: 'KJFK', iata: 'JFK', name: 'New York Kennedy', lat: 40.6413, lng: -73.7781, country: 'US' },
  { icao: 'KORD', iata: 'ORD', name: "Chicago O'Hare", lat: 41.9742, lng: -87.9073, country: 'US' },
  { icao: 'KATL', iata: 'ATL', name: 'Atlanta Hartsfield', lat: 33.6407, lng: -84.4277, country: 'US' },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco Intl', lat: 37.6213, lng: -122.379, country: 'US' },
  { icao: 'KDEN', iata: 'DEN', name: 'Denver Intl', lat: 39.8561, lng: -104.6737, country: 'US' },
  { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma', lat: 47.4502, lng: -122.3088, country: 'US' },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami Intl', lat: 25.7959, lng: -80.287, country: 'US' },
  { icao: 'CYYZ', iata: 'YYZ', name: 'Toronto Pearson', lat: 43.6777, lng: -79.6248, country: 'CA' },
  { icao: 'CYYC', iata: 'YYC', name: 'Calgary Intl', lat: 51.1215, lng: -114.0082, country: 'CA' },
  { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow', lat: 51.47, lng: -0.4543, country: 'GB' },
  { icao: 'LFPG', iata: 'CDG', name: 'Paris Charles de Gaulle', lat: 49.0097, lng: 2.5479, country: 'FR' },
  { icao: 'EDDF', iata: 'FRA', name: 'Frankfurt Intl', lat: 50.0333, lng: 8.5706, country: 'DE' },
  { icao: 'LEMD', iata: 'MAD', name: 'Madrid Barajas', lat: 40.4722, lng: -3.5609, country: 'ES' },
  { icao: 'LIRF', iata: 'FCO', name: 'Rome Fiumicino', lat: 41.8003, lng: 12.2389, country: 'IT' },
  { icao: 'LPPT', iata: 'LIS', name: 'Lisbon Humberto Delgado', lat: 38.7813, lng: -9.1359, country: 'PT' },
  { icao: 'EHAM', iata: 'AMS', name: 'Amsterdam Schiphol', lat: 52.3105, lng: 4.7683, country: 'NL' },
  { icao: 'EKCH', iata: 'CPH', name: 'Copenhagen Kastrup', lat: 55.618, lng: 12.6508, country: 'DK' },
  { icao: 'ESSA', iata: 'ARN', name: 'Stockholm Arlanda', lat: 59.6519, lng: 17.9186, country: 'SE' },
  { icao: 'ENGM', iata: 'OSL', name: 'Oslo Gardermoen', lat: 60.1976, lng: 11.1004, country: 'NO' },
  { icao: 'EFHK', iata: 'HEL', name: 'Helsinki Vantaa', lat: 60.3183, lng: 24.9497, country: 'FI' },
  { icao: 'EPWA', iata: 'WAW', name: 'Warsaw Chopin', lat: 52.1657, lng: 20.9671, country: 'PL' },
  { icao: 'UUEE', iata: 'SVO', name: 'Moscow Sheremetyevo', lat: 55.9736, lng: 37.5047, country: 'RU' },
  { icao: 'OMDB', iata: 'DXB', name: 'Dubai Intl', lat: 25.2532, lng: 55.3657, country: 'AE' },
  { icao: 'OTHH', iata: 'DOH', name: 'Doha Hamad Intl', lat: 25.2731, lng: 51.6081, country: 'QA' },
  { icao: 'RJAA', iata: 'NRT', name: 'Tokyo Narita', lat: 35.7653, lng: 140.3855, country: 'JP' },
  { icao: 'RJTT', iata: 'HND', name: 'Tokyo Haneda', lat: 35.5494, lng: 139.7798, country: 'JP' },
  { icao: 'RKSI', iata: 'ICN', name: 'Seoul Incheon', lat: 37.4602, lng: 126.4407, country: 'KR' },
  { icao: 'ZSPD', iata: 'PVG', name: 'Shanghai Pudong', lat: 31.1443, lng: 121.8083, country: 'CN' },
  { icao: 'ZBAA', iata: 'PEK', name: 'Beijing Capital', lat: 40.0801, lng: 116.5846, country: 'CN' },
  { icao: 'VHHH', iata: 'HKG', name: 'Hong Kong Intl', lat: 22.308, lng: 113.9185, country: 'HK' },
  { icao: 'WSSS', iata: 'SIN', name: 'Singapore Changi', lat: 1.3644, lng: 103.9915, country: 'SG' },
  { icao: 'VTBS', iata: 'BKK', name: 'Bangkok Suvarnabhumi', lat: 13.69, lng: 100.7501, country: 'TH' },
  { icao: 'WIII', iata: 'CGK', name: 'Jakarta Soekarno-Hatta', lat: -6.1256, lng: 106.6559, country: 'ID' },
  { icao: 'RPLL', iata: 'MNL', name: 'Manila Ninoy Aquino', lat: 14.5086, lng: 121.0198, country: 'PH' },
  { icao: 'YSSY', iata: 'SYD', name: 'Sydney Kingsford Smith', lat: -33.9399, lng: 151.1753, country: 'AU' },
  { icao: 'YMML', iata: 'MEL', name: 'Melbourne Tullamarine', lat: -37.6733, lng: 144.8433, country: 'AU' },
  { icao: 'NZAA', iata: 'AKL', name: 'Auckland Intl', lat: -37.0082, lng: 174.785, country: 'NZ' },
  { icao: 'SBGR', iata: 'GRU', name: 'Sao Paulo Guarulhos', lat: -23.4356, lng: -46.4731, country: 'BR' },
  { icao: 'SAEZ', iata: 'EZE', name: 'Buenos Aires Ezeiza', lat: -34.8222, lng: -58.5358, country: 'AR' },
  { icao: 'SCEL', iata: 'SCL', name: 'Santiago Arturo Merino', lat: -33.393, lng: -70.7858, country: 'CL' },
  { icao: 'FAOR', iata: 'JNB', name: 'Johannesburg O.R. Tambo', lat: -26.1367, lng: 28.2411, country: 'ZA' },
  { icao: 'HECA', iata: 'CAI', name: 'Cairo Intl', lat: 30.1219, lng: 31.4056, country: 'EG' },
  { icao: 'OKBK', iata: 'KWI', name: 'Kuwait Intl', lat: 29.2266, lng: 47.9689, country: 'KW' },
  { icao: 'OEJN', iata: 'JED', name: 'Jeddah King Abdulaziz', lat: 21.6796, lng: 39.1565, country: 'SA' },
  { icao: 'VIDP', iata: 'DEL', name: 'Delhi Indira Gandhi', lat: 28.5562, lng: 77.1, country: 'IN' },
  { icao: 'VABB', iata: 'BOM', name: 'Mumbai Chhatrapati Shivaji', lat: 19.0896, lng: 72.8656, country: 'IN' },
  { icao: 'OMAA', iata: 'AUH', name: 'Abu Dhabi Intl', lat: 24.433, lng: 54.6511, country: 'AE' },
  { icao: 'OERK', iata: 'RUH', name: 'Riyadh King Khalid', lat: 24.9576, lng: 46.6988, country: 'SA' },
  { icao: 'HKJK', iata: 'NBO', name: 'Nairobi Jomo Kenyatta', lat: -1.3192, lng: 36.9278, country: 'KE' },
  { icao: 'DNMM', iata: 'LOS', name: 'Lagos Murtala Muhammed', lat: 6.5774, lng: 3.3212, country: 'NG' },
  { icao: 'DAAA', iata: 'ALG', name: 'Algiers Houari Boumediene', lat: 36.689, lng: 3.0898, country: 'DZ' },
];

const AIRLINES: Airline[] = [
  { icao: 'DAL', iata: 'DL', callsign: 'Delta', flag: 'US', fleet: ['A320', 'A321', 'B738', 'B739', 'B763', 'A333', 'A359'] },
  { icao: 'UAL', iata: 'UA', callsign: 'United', flag: 'US', fleet: ['A20N', 'B738', 'B38M', 'B772', 'B788', 'B789', 'B78X'] },
  { icao: 'AAL', iata: 'AA', callsign: 'American', flag: 'US', fleet: ['A320', 'A321', 'B738', 'B77W', 'B788', 'A388'] },
  { icao: 'AFR', iata: 'AF', callsign: 'Airfrance', flag: 'FR', fleet: ['A20N', 'A21N', 'A332', 'A359', 'A35K'] },
  { icao: 'BAW', iata: 'BA', callsign: 'Speedbird', flag: 'GB', fleet: ['A20N', 'A21N', 'A35K', 'B772', 'A388'] },
  { icao: 'DLH', iata: 'LH', callsign: 'Lufthansa', flag: 'DE', fleet: ['A20N', 'A320', 'A21N', 'A333', 'A359'] },
  { icao: 'KLM', iata: 'KL', callsign: 'Klm', flag: 'NL', fleet: ['B738', 'B739', 'A332', 'A333', 'B78X'] },
  { icao: 'SIA', iata: 'SQ', callsign: 'Singapore', flag: 'SG', fleet: ['A359', 'A35K', 'A388', 'B77W', 'B78X'] },
  { icao: 'QFA', iata: 'QF', callsign: 'Qantas', flag: 'AU', fleet: ['B738', 'B789', 'A333', 'A388'] },
  { icao: 'UAE', iata: 'EK', callsign: 'Emirates', flag: 'AE', fleet: ['A388', 'B77W', 'B78X', 'A359'] },
  { icao: 'QTR', iata: 'QR', callsign: 'Qatari', flag: 'QA', fleet: ['A320', 'A35K', 'B77W', 'A388'] },
  { icao: 'ETH', iata: 'ET', callsign: 'Ethiopian', flag: 'ET', fleet: ['B738', 'B77W', 'B788', 'B789', 'A359'] },
  { icao: 'THY', iata: 'TK', callsign: 'Turkair', flag: 'TR', fleet: ['A20N', 'A21N', 'B738', 'A332', 'B77W'] },
  { icao: 'AIC', iata: 'AI', callsign: 'Airindia', flag: 'IN', fleet: ['A20N', 'A21N', 'B788', 'B77W'] },
  { icao: 'CCA', iata: 'CA', callsign: 'Airchina', flag: 'CN', fleet: ['A20N', 'A21N', 'B738', 'A359'] },
  { icao: 'CES', iata: 'MU', callsign: 'China Eastern', flag: 'CN', fleet: ['A20N', 'A21N', 'B738', 'A359'] },
  { icao: 'KAL', iata: 'KE', callsign: 'Koreanair', flag: 'KR', fleet: ['B38M', 'B789', 'B77W', 'A333'] },
  { icao: 'JAL', iata: 'JL', callsign: 'Japanair', flag: 'JP', fleet: ['B738', 'B789', 'B77W', 'A359'] },
  { icao: 'CPA', iata: 'CX', callsign: 'Cathay', flag: 'HK', fleet: ['A333', 'A35K', 'B77W'] },
  { icao: 'ACA', iata: 'AC', callsign: 'AirCanada', flag: 'CA', fleet: ['A20N', 'B38M', 'A333', 'B789'] },
  { icao: 'LAN', iata: 'LA', callsign: 'Latam', flag: 'CL', fleet: ['A20N', 'A21N', 'B788', 'B789'] },
  { icao: 'GLO', iata: 'G3', callsign: 'Gol', flag: 'BR', fleet: ['B738', 'B38M'] },
  { icao: 'SAA', iata: 'SA', callsign: 'Springbok', flag: 'ZA', fleet: ['A333', 'B738', 'B789'] },
  { icao: 'KAC', iata: 'KU', callsign: 'Kuwaiti', flag: 'KW', fleet: ['A320', 'A359', 'B77W'] },
  { icao: 'MSR', iata: 'MS', callsign: 'Egyptair', flag: 'EG', fleet: ['A20N', 'A321', 'B738'] },
  { icao: 'SWR', iata: 'LX', callsign: 'Swiss', flag: 'CH', fleet: ['A20N', 'A21N', 'A333', 'A359'] },
  { icao: 'FIN', iata: 'AY', callsign: 'Finnair', flag: 'FI', fleet: ['A20N', 'A21N', 'A359'] },
  { icao: 'NAX', iata: 'DY', callsign: 'Nor Shuttle', flag: 'NO', fleet: ['B738', 'B38M'] },
  { icao: 'SAS', iata: 'SK', callsign: 'Scandinavian', flag: 'SE', fleet: ['A20N', 'A21N', 'A359'] },
  { icao: 'LOT', iata: 'LO', callsign: 'Lot', flag: 'PL', fleet: ['B738', 'B788', 'B789'] },
  { icao: 'AFL', iata: 'SU', callsign: 'Aeroflot', flag: 'RU', fleet: ['A320', 'A21N', 'A333'] },
  { icao: 'TAP', iata: 'TP', callsign: 'Portuga', flag: 'PT', fleet: ['A20N', 'A21N', 'A333'] },
  { icao: 'IBE', iata: 'IB', callsign: 'Iberia', flag: 'ES', fleet: ['A20N', 'A21N', 'A359'] },
  { icao: 'AZA', iata: 'AZ', callsign: 'Alitalia', flag: 'IT', fleet: ['A20N', 'A21N', 'A333'] },
  { icao: 'ANA', iata: 'NH', callsign: 'All Nippon', flag: 'JP', fleet: ['A20N', 'A21N', 'B788', 'B789', 'B77W'] },
  { icao: 'TAI', iata: 'TG', callsign: 'Thai', flag: 'TH', fleet: ['A20N', 'A21N', 'B77W', 'A388'] },
  { icao: 'GIA', iata: 'GA', callsign: 'Garuda', flag: 'ID', fleet: ['B738', 'A333', 'A20N'] },
  { icao: 'PAL', iata: 'PR', callsign: 'Philippine', flag: 'PH', fleet: ['A321', 'A333', 'A359'] },
  { icao: 'ANZ', iata: 'NZ', callsign: 'Air New Zealand', flag: 'NZ', fleet: ['A20N', 'A21N', 'B789', 'B77W'] },
];

// Major trunk routes (ICAO pairs). Flights are generated along these corridors.
const ROUTE_PAIRS: [string, string][] = [
  ['KLAX', 'KJFK'], ['KLAX', 'KORD'], ['KLAX', 'EGLL'], ['KLAX', 'RKSI'], ['KSFO', 'KSEA'],
  ['KORD', 'KATL'], ['KORD', 'EDDF'], ['KSEA', 'CYYZ'], ['KSEA', 'ZSPD'], ['KMIA', 'SBGR'],
  ['KMIA', 'EGLL'], ['KATL', 'KJFK'], ['KJFK', 'EGLL'], ['KJFK', 'CYYZ'], ['KJFK', 'LFPG'],
  ['KSFO', 'KORD'], ['KDEN', 'KORD'], ['KATL', 'KMIA'], ['KSEA', 'KDEN'], ['CYYZ', 'LFPG'],
  ['EGLL', 'LFPG'], ['EGLL', 'EDDF'], ['EGLL', 'OMDB'], ['EGLL', 'WSSS'], ['LFPG', 'JFK'] as [string, string],
  ['EDDF', 'UUEE'], ['EDDF', 'OTHH'], ['LEMD', 'SAEZ'], ['LPPT', 'SBGR'], ['EHAM', 'RKSI'],
  ['EHAM', 'EGLL'], ['EKCH', 'ESSA'], ['EFHK', 'RKSI'], ['EPWA', 'UUEE'], ['UUEE', 'ZSPD'],
  ['OMDB', 'LFPG'], ['OMDB', 'EDDF'], ['OTHH', 'KLAX'], ['RJTT', 'RKSI'], ['RJTT', 'YSSY'],
  ['RKSI', 'ZBAA'], ['RKSI', 'VHHH'], ['ZSPD', 'WSSS'], ['ZBAA', 'WSSS'], ['VHHH', 'WSSS'],
  ['WSSS', 'YSSY'], ['WSSS', 'RPLL'], ['VTBS', 'WIII'], ['WIII', 'YSSY'], ['YMML', 'YSSY'],
  ['SBGR', 'KMIA'], ['SAEZ', 'KATL'], ['FAOR', 'EGLL'], ['FAOR', 'LFPG'], ['HECA', 'EDDF'],
  ['OKBK', 'OMDB'], ['OEJN', 'OMDB'], ['VIDP', 'EGLL'], ['VIDP', 'VABB'], ['VABB', 'EGLL'],
  ['OMAA', 'OTHH'], ['OERK', 'OMDB'], ['HKJK', 'EDDF'], ['DNMM', 'LFPG'], ['DAAA', 'LEMD'],
];

const AIRCRAFT_TYPES: Record<string, string> = {
  A20N: 'Airbus A320neo', A21N: 'Airbus A321neo', A319: 'Airbus A319', A320: 'Airbus A320',
  A321: 'Airbus A321', A332: 'Airbus A330-200', A333: 'Airbus A330-300', A338: 'Airbus A330-800',
  A339: 'Airbus A330-900', A359: 'Airbus A350-900', A35K: 'Airbus A350-1000', A388: 'Airbus A380-800',
  B738: 'Boeing 737-800', B38M: 'Boeing 737 MAX 8', B739: 'Boeing 737-900', B744: 'Boeing 747-400',
  B748: 'Boeing 747-8', B752: 'Boeing 757-200', B763: 'Boeing 767-300', B772: 'Boeing 777-200',
  B77W: 'Boeing 777-300ER', B773: 'Boeing 777-300', B788: 'Boeing 787-8', B789: 'Boeing 787-9',
  B78X: 'Boeing 787-10', E190: 'Embraer E190', E195: 'Embraer E195', CRJ9: 'Mitsubishi CRJ900',
};

export function aircraftTypeName(code: string): string {
  return AIRCRAFT_TYPES[(code ?? '').toUpperCase()] ?? code ?? '';
}

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

function toDeg(r: number): number {
  return (r * 180) / Math.PI;
}

function distanceKm(a: Airport, b: Airport): number {
  const r = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

function initialBearing(a: Airport, b: Airport): number {
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const COUNTRY_PREFIX: Record<string, string> = {
  US: 'N', CA: 'C', GB: 'G', FR: 'F', DE: 'D', ES: 'EC', IT: 'I', PT: 'CS', NL: 'PH',
  DK: 'OY', SE: 'SE', NO: 'LN', FI: 'OH', PL: 'SP', RU: 'RA', AE: 'A6', QA: 'A7',
  JP: 'JA', KR: 'HL', CN: 'B', HK: 'B', SG: '9V', TH: 'HS', ID: 'PK', PH: 'RP',
  AU: 'VH', NZ: 'ZK', BR: 'PR', AR: 'LV', CL: 'CC', ZA: 'ZS', EG: 'SU', KW: '9K',
  SA: 'HZ', IN: 'VT', KE: '5Y', NG: '5N', DZ: '7T', CH: 'HB', ET: 'ET',
};

function tailNumber(country: string, aircraftIcao: string, salt: number): string {
  const prefix = COUNTRY_PREFIX[country] ?? 'N';
  let suffix: string;
  if (country === 'RU') {
    suffix = `-${String(70000 + ((salt * 577) % 9000))}`;
  } else if (country === 'HK' || country === 'CN') {
    suffix = `-${String(1000 + ((salt * 313) % 9000))}`;
  } else {
    const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = String(100 + ((salt * 271) % 900));
    suffix = `${alpha[salt % alpha.length]}${digits}${alpha[(salt * 7) % alpha.length]}`;
    if (country === 'US') return `N${digits}${alpha[salt % alpha.length]}${alpha[(salt * 7) % alpha.length]}`;
  }
  return `${prefix}${suffix}`;
}

const CRUISE_SPEED_KT = 494; // ~860 km/h block speed
const MIN_FLYING_KT = 450;

const EMERGENCY_INDEXES = [3, 17, 29]; // a few flights carry emergency squawks for the alert engine

export function generateSimulatedFlights(now: number = Date.now()): LiveFlight[] {
  const simNow = Math.floor(now / 1000);
  const flights: LiveFlight[] = [];
  const seconds = simNow % 86400;

  for (let i = 0; i < ROUTE_PAIRS.length; i++) {
    const [depIcao, arrIcao] = ROUTE_PAIRS[i];
    const dep = AIRPORTS.find((a) => a.icao === depIcao);
    const arr = AIRPORTS.find((a) => a.icao === arrIcao);
    if (!dep || !arr) continue;

    const airline = AIRLINES[i % AIRLINES.length];
    const aircraftIcao = airline.fleet[(i * 3) % airline.fleet.length];
    const dist = distanceKm(dep, arr);
    const durationMin = Math.max(45, Math.round(((dist * 0.54) / CRUISE_SPEED_KT) * 60 + 24));
    const phaseMin = ((seconds / 60 + i * 37.3) % durationMin + durationMin) % durationMin;
    const frac = phaseMin / durationMin;

    // One out of every 8 flights is parked at the airport (ground status)
    if (i % 8 === 0) {
      const wob = 0.015;
      const jitter = (i * 97) % 360;
      flights.push({
        hex: `${(0xa00000 + i * 97).toString(16).toUpperCase()}`.slice(0, 6) + 'A',
        callsign: `${airline.iata}${1000 + i * 37}`,
        airlineIcao: airline.icao,
        flag: airline.flag,
        lat: Math.round((dep.lat + Math.sin(jitter) * wob) * 10000) / 10000,
        lng: Math.round((dep.lng + Math.cos(jitter) * wob) * 10000) / 10000,
        altFt: 0,
        speedKt: Math.round((i * 13) % 26),
        vsFpm: 0,
        heading: Math.round((jitter + initialBearing(dep, arr)) % 360),
        squawk: String(2000 + (i % 77)),
        dep: dep.iata,
        arr: arr.iata,
        reg: tailNumber(airline.flag, aircraftIcao, i),
        aircraftIcao,
        status: 'ground',
        updated: simNow,
      });
      continue;
    }

    const climbFrac = 0.07;
    const descFrac = 0.92;
    const cruiseAlt = Math.round((31000 + ((i * 971) % 7000)) / 100) * 100; // FL310-FL380
    let altFt: number;
    let vsFpm: number;
    let speedKt: number;

    if (frac < climbFrac) {
      const p = frac / climbFrac;
      altFt = Math.round(1500 + p * (cruiseAlt - 1500));
      vsFpm = 1800 + ((i * 211) % 800);
      speedKt = Math.round(260 + p * (MIN_FLYING_KT - 260));
    } else if (frac > descFrac) {
      const p = (frac - descFrac) / (1 - descFrac);
      altFt = Math.round(cruiseAlt * (1 - p) + 1200);
      vsFpm = -(1800 + ((i * 173) % 800));
      speedKt = Math.round(MIN_FLYING_KT - p * 120);
    } else {
      altFt = cruiseAlt + Math.sin(seconds / 300 + i) * 40;
      vsFpm = Math.round(Math.sin(seconds / 240 + i * 1.7) * 220);
      speedKt = Math.round(CRUISE_SPEED_KT + ((i * 31) % 40) - 20);
    }

    const lat = dep.lat + (arr.lat - dep.lat) * frac;
    const lng = dep.lng + (arr.lng - dep.lng) * frac;
    const wiggleLat = Math.sin(seconds / 480 + i * 2.1) * 0.35;
    const wiggleLng = Math.cos(seconds / 520 + i * 1.4) * 0.35;
    const baseHeading = initialBearing(dep, arr);
    const heading = (baseHeading + Math.round(wiggleLat * 6)) % 360;

    const isEmergency = EMERGENCY_INDEXES.includes(i);
    const squawk = isEmergency
      ? ['7700', '7600', '7500'][i % 3]
      : String(2000 + ((i * 977) % 3777));

    flights.push({
      hex: (0xa00000 + i * 97).toString(16).toUpperCase() + String(i % 10),
      callsign: `${airline.iata}${1000 + i * 37}`,
      airlineIcao: airline.icao,
      flag: airline.flag,
      lat: Math.round((lat + wiggleLat) * 10000) / 10000,
      lng: Math.round((lng + wiggleLng) * 10000) / 10000,
      altFt: Math.round(altFt),
      speedKt,
      vsFpm,
      heading: Math.round(heading),
      squawk,
      dep: dep.iata,
      arr: arr.iata,
      reg: tailNumber(airline.flag, aircraftIcao, i),
      aircraftIcao,
      status: 'airborne',
      updated: simNow,
    });
  }

  return flights;
}