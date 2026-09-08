import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DonutChart, TrafficCurve } from '@/components/skytrack/charts';
import { Screen } from '@/components/skytrack/screen';
import { Icon, MetricCell, Pill, ProgressBar } from '@/components/skytrack/ui';
import { radius, SKY, space, type } from '@/constants/theme';
import { categorize, countryName, formatNum, LiveFlight } from '@/lib/aviation';
import { FEED_INTERVAL_MS, useLiveFlights } from '@/lib/feed';

type Overview = {
  label: string;
  value: string;
  unit?: string;
  trend: string;
  trendColor: string;
  sub: string;
  valueColor: string;
  icon: 'travel-explore' | 'flight-takeoff' | 'flight-land' | 'public' | 'north-east' | 'speed';
  accent: string;
};

type Country = {
  code: string;
  name: string;
  count: number;
  pct: number;
  pillColor: string;
  barColor: string;
};

type Altitude = {
  name: string;
  band: string;
  count: number;
  pct: number;
  dot: string;
  bar: string;
  color: string;
};

type CategoryRow = {
  name: string;
  models: string;
  count: number;
  pct: number;
  icon: 'flight' | 'airlines' | 'connecting-airports';
  color: string;
};

const PALETTE = [
  { pill: SKY.colors.primary, bar: SKY.colors.primary },
  { pill: SKY.colors.secondary, bar: SKY.colors.secondary },
  { pill: SKY.colors.outline, bar: SKY.colors.outline },
  { pill: SKY.colors.tertiary, bar: SKY.colors.tertiary },
  { pill: SKY.colors.primary, bar: SKY.colors.primaryContainer },
  { pill: SKY.colors.secondary, bar: SKY.colors.secondaryFixedDim },
];

function derive(flights: LiveFlight[]) {
  const total = flights.length;
  const airborne = flights.filter((f) => f.status === 'airborne');
  const ground = total - airborne.length;
  const airPct = total > 0 ? (airborne.length / total) * 100 : 0;
  const gndPct = total > 0 ? (ground / total) * 100 : 0;

  const flags = new Set(flights.map((f) => f.flag).filter(Boolean));
  const nations = flags.size;

  const avgAlt = airborne.length
    ? Math.round(airborne.reduce((s, f) => s + f.altFt, 0) / airborne.length)
    : 0;
  const avgSpd = airborne.length
    ? Math.round(airborne.reduce((s, f) => s + f.speedKt, 0) / airborne.length)
    : 0;

  const byFlag = new Map<string, number>();
  for (const f of flights) {
    const k = f.flag || 'ZZ';
    byFlag.set(k, (byFlag.get(k) ?? 0) + 1);
  }
  const countries: Country[] = [...byFlag.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code, count], i) => {
      const tone = PALETTE[i % PALETTE.length];
      return {
        code,
        name: countryName(code),
        count,
        pct: total > 0 ? (count / total) * 100 : 0,
        pillColor: tone.pill,
        barColor: tone.bar,
      };
    });

  const buckets = [
    { name: 'High Cruise', band: 'FL350 - FL430', min: 35000, dot: SKY.colors.secondary, bar: SKY.colors.secondary, color: SKY.colors.secondary },
    { name: 'Mid Cruise', band: 'FL250 - FL340', min: 25000, dot: SKY.colors.primaryContainer, bar: SKY.colors.primaryContainer, color: SKY.colors.primary },
    { name: 'Low / Approach', band: 'FL100 - FL240', min: 10000, dot: SKY.colors.surfaceTint, bar: SKY.colors.surfaceTint, color: SKY.colors.onSurfaceVariant },
    { name: 'Terminal / Ground', band: '< FL100', min: 0, dot: SKY.colors.outline, bar: SKY.colors.outline, color: SKY.colors.outline },
  ];
  const altitudes: Altitude[] = buckets.map((b) => {
    const actual =
      b.min === 35000
        ? flights.filter((f) => f.altFt >= 35000).length
        : b.min === 25000
          ? flights.filter((f) => f.altFt >= 25000 && f.altFt < 35000).length
          : b.min === 10000
            ? flights.filter((f) => f.altFt >= 10000 && f.altFt < 25000).length
            : flights.filter((f) => f.altFt < 10000).length;
    return {
      name: b.name,
      band: b.band,
      count: actual,
      pct: total > 0 ? (actual / total) * 100 : 0,
      dot: b.dot,
      bar: b.bar,
      color: b.color,
    };
  });

  const counts = { heavy: 0, narrow: 0, regional: 0 };
  for (const f of flights) {
    counts[categorize(f.aircraftIcao).toLowerCase() as keyof typeof counts]++;
  }
  const catTotal = counts.heavy + counts.narrow + counts.regional || 1;
  const categories: CategoryRow[] = [
    {
      name: 'Commercial Heavy',
      models: 'Wide-body ops',
      count: counts.heavy,
      pct: (counts.heavy / catTotal) * 100,
      icon: 'flight',
      color: SKY.colors.primary,
    },
    {
      name: 'Narrow-body Commercial',
      models: 'A32x / B737 / A220',
      count: counts.narrow,
      pct: (counts.narrow / catTotal) * 100,
      icon: 'airlines',
      color: SKY.colors.secondary,
    },
    {
      name: 'Regional & Business Jets',
      models: 'E1xx / CRJ / G650 / Props',
      count: counts.regional,
      pct: (counts.regional / catTotal) * 100,
      icon: 'connecting-airports',
      color: SKY.colors.tertiary,
    },
  ];

  return {
    total,
    airborne,
    ground,
    airPct,
    gndPct,
    nations,
    avgAlt,
    avgSpd,
    countries,
    altitudes,
    categories,
  };
}

const pct1 = (v: number) => `${Math.round(v * 10) / 10}%`;

function CountryRow({ c }: { c: Country }) {
  return (
    <View style={styles.chartRow}>
      <View style={styles.countryLabelRow}>
        <View style={styles.codePill}>
          <Text style={[type.pill, { color: c.pillColor }]}>{c.code}</Text>
        </View>
        <Text style={[type.bodySm, { color: SKY.colors.onSurface, fontWeight: '500' }]} numberOfLines={1}>{c.name}</Text>
        <View style={styles.countryStats}>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>{formatNum(c.count)} AC</Text>
          <Text style={[type.pill, { color: c.pillColor, fontWeight: '700' }]}>{pct1(c.pct)}</Text>
        </View>
      </View>
      <ProgressBar pct={c.pct} height={8} color={c.barColor} bg={SKY.colors.surfaceContainer} />
    </View>
  );
}

function AltitudeRow({ a }: { a: Altitude }) {
  return (
    <View style={styles.altRow}>
      <View style={styles.altLabelRow}>
        <View style={[styles.altDot, { backgroundColor: a.dot }]} />
        <Text style={[type.bodySm, { color: SKY.colors.onSurface, fontWeight: '500' }]}>{a.name}</Text>
        <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>{a.band}</Text>
        <Text style={[type.telemetry, { color: a.color, fontWeight: '600' }]}>
          {formatNum(a.count)} AC ({pct1(a.pct)})
        </Text>
      </View>
      <ProgressBar pct={a.pct} height={10} color={a.bar} bg={SKY.colors.surfaceContainerHighest} />
    </View>
  );
}

export default function StatsScreen() {
  const { flights, loading, error, updatedAt } = useLiveFlights();
  const d = useMemo(() => derive(flights), [flights]);

  const OVERVIEW: Overview[] = [
    {
      label: 'TOTAL FLIGHTS',
      value: formatNum(d.total),
      trend: error ? 'OFFLINE' : 'LIVE FEED',
      trendColor: SKY.colors.tertiary,
      sub: 'Monitored Sectors',
      valueColor: SKY.colors.primary,
      icon: 'travel-explore',
      accent: 'rgba(44,53,69,0.35)',
    },
    {
      label: 'AIRBORNE',
      value: formatNum(d.airborne.length),
      trend: pct1(d.airPct),
      trendColor: SKY.colors.secondary,
      sub: 'Transponder Active',
      valueColor: SKY.colors.secondary,
      icon: 'flight-takeoff',
      accent: 'rgba(76,215,246,0.15)',
    },
    {
      label: 'ON GROUND',
      value: formatNum(d.ground),
      trend: pct1(d.gndPct),
      trendColor: SKY.colors.outline,
      sub: 'Taxi & Apron Hold',
      valueColor: SKY.colors.onSurface,
      icon: 'flight-land',
      accent: 'rgba(44,53,69,0.35)',
    },
    {
      label: 'ACTIVE NATIONS',
      value: String(d.nations),
      trend: 'ICAO',
      trendColor: SKY.colors.tertiary,
      sub: 'Registered Flags',
      valueColor: SKY.colors.tertiary,
      icon: 'public',
      accent: 'rgba(82,232,124,0.15)',
    },
    {
      label: 'AVG CRUISING ALT',
      value: formatNum(d.avgAlt),
      unit: 'FT',
      trend: '',
      trendColor: SKY.colors.primary,
      sub: `FL${d.avgAlt ? Math.floor(d.avgAlt / 100) : 0} Flight Level`,
      valueColor: SKY.colors.primary,
      icon: 'north-east',
      accent: 'rgba(142,213,255,0.15)',
    },
    {
      label: 'AVG GROUND SPEED',
      value: formatNum(d.avgSpd),
      unit: 'KT',
      trend: '',
      trendColor: SKY.colors.secondary,
      sub: `Mach ~${d.avgSpd ? (d.avgSpd / 660).toFixed(2) : '0.00'} Median`,
      valueColor: SKY.colors.secondary,
      icon: 'speed',
      accent: 'rgba(76,215,246,0.15)',
    },
  ];

  return (
    <Screen subtitle="Fleet Analytics">
      {/* Sub-header */}
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <Icon name="query-stats" size={20} color={SKY.colors.primary} />
            <Text style={[type.headlineLgMobile, { color: SKY.colors.onSurface, textTransform: 'uppercase', letterSpacing: -0.3 }]}>
              Aviation Statistics
            </Text>
          </View>
          <View style={styles.streamPill}>
            <View style={styles.streamDot} />
            <Text style={[type.pill, { color: SKY.colors.tertiary }]}>
              {error ? 'FEED INTERRUPTED' : loading && !d.total ? 'SYNCING' : 'STREAM SYNCED'}
            </Text>
          </View>
        </View>
        <Text style={[type.bodySm, { color: SKY.colors.onSurfaceVariant }]}>
          Global traffic patterns, altitude distribution, and fleet dynamics
        </Text>
        <View style={styles.selectorRow}>
          <View style={styles.worldBtn}>
            <Text style={[type.pill, { color: SKY.colors.primary }]}>WORLD</Text>
            <Icon name="expand-more" size={14} color={SKY.colors.primary} />
          </View>
          <View style={styles.windowBtn}>
            <Icon name="schedule" size={14} color={SKY.colors.secondary} />
            <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>LIVE SNAPSHOT</Text>
          </View>
          <Text style={[type.telemetry, { color: SKY.colors.outline }]}>
            {updatedAt ? `SYNC ${new Date(updatedAt).toISOString().slice(11, 19)} UTC` : 'EPOCH #0'}
          </Text>
        </View>
      </View>

      {/* Top telemetry summary grid */}
      <View style={styles.grid}>
        {OVERVIEW.map((m) => (
          <View key={m.label} style={styles.gridItem}>
            <MetricCell
              label={m.label}
              value={m.value}
              unit={m.unit}
              valueColor={m.valueColor}
              sub={m.sub}
              icon={m.icon}
              accent={m.accent}
            />
            {m.trend ? (
              <Text style={[type.pill, { color: m.trendColor, marginTop: space.xs }]}>{m.trend}</Text>
            ) : null}
          </View>
        ))}
      </View>

      {/* Aircraft by country */}
      <View style={styles.section}>
        <View style={styles.sectionTop}>
          <View style={styles.sectionTitleRow}>
            <Icon name="flag" size={18} color={SKY.colors.primary} />
            <Text style={[type.headlineMd, { color: SKY.colors.onSurface, textTransform: 'uppercase' }]}>
              Aircraft by Country
            </Text>
          </View>
          <Text style={[type.telemetry, { color: SKY.colors.outline }]}>TOP FLIGHT OPERATORS</Text>
        </View>
        <View style={styles.chartCol}>
          {d.countries.length ? (
            d.countries.map((c) => (
              <CountryRow key={c.code} c={c} />
            ))
          ) : (
            <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>No country flags in current feed</Text>
          )}
        </View>
      </View>

      {/* Altitude distribution */}
      <View style={styles.section}>
        <View style={styles.sectionTop}>
          <View style={styles.sectionTitleRow}>
            <Icon name="vertical-align-top" size={18} color={SKY.colors.secondary} />
            <Text style={[type.headlineMd, { color: SKY.colors.onSurface, textTransform: 'uppercase' }]}>
              Altitude Distribution
            </Text>
          </View>
          <Pill text="FLIGHT LEVELS" bg={SKY.colors.surfaceContainer} color={SKY.colors.primary} />
        </View>
        <View style={styles.altCol}>
          {d.altitudes.map((a) => (
            <AltitudeRow key={a.name} a={a} />
          ))}
        </View>
      </View>

      {/* Status & peak surge */}
      <View style={styles.section}>
        <View style={styles.sectionTop}>
          <View style={styles.sectionTitleRow}>
            <Icon name="timelapse" size={18} color={SKY.colors.primary} />
            <Text style={[type.headlineMd, { color: SKY.colors.onSurface, textTransform: 'uppercase' }]}>
              Status & Peak Surge
            </Text>
          </View>
          <Pill text="LIVE CYCLE" bg={SKY.colors.surfaceContainer} color={SKY.colors.tertiary} />
        </View>

        <View style={styles.donutRow}>
          <View style={styles.donutBox}>
            <DonutChart pct={d.airPct} />
            <View style={styles.donutCenter}>
              <Text style={[type.metricDisplay, { color: SKY.colors.secondary, fontSize: 20, lineHeight: 24 }]}>
                {d.total ? Math.round(d.airPct) : 0}%
              </Text>
              <Text style={[type.pill, { color: SKY.colors.outline, fontWeight: '600' }]}>AIR</Text>
            </View>
          </View>
          <View style={styles.donutLegend}>
            <View style={styles.donutItem}>
              <View style={[styles.donutDot, { backgroundColor: SKY.colors.secondary }]} />
              <Text style={[type.metricLabel, { color: SKY.colors.onSurface }]}>AIRBORNE SECTOR</Text>
            </View>
            <Text style={[type.headlineMd, { color: SKY.colors.secondary, marginLeft: space.md, marginTop: space.xxs, fontWeight: '700' }]}>
              {formatNum(d.airborne.length)} <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>aircraft</Text>
            </Text>
            <View style={[styles.donutItem, { marginTop: space.sm }]}>
              <View style={[styles.donutDot, { backgroundColor: SKY.colors.outline }]} />
              <Text style={[type.metricLabel, { color: SKY.colors.onSurface }]}>SURFACE APRON</Text>
            </View>
            <Text style={[type.headlineMd, { color: SKY.colors.outline, marginLeft: space.md, marginTop: space.xxs, fontWeight: '700' }]}>
              {formatNum(d.ground)} <Text style={[type.telemetry, { color: SKY.colors.outline }]}>aircraft</Text>
            </Text>
          </View>
        </View>

        <View style={styles.trafficWrap}>
          <View style={styles.trafficHead}>
            <Text style={[type.metricLabel, { color: SKY.colors.onSurfaceVariant }]}>HOURLY AIRBORNE CONCURRENCY</Text>
            <View style={styles.surgePill}>
              <View style={styles.streamDot} />
              <Text style={[type.pill, { color: SKY.colors.tertiary }]}>CYCLE: {FEED_INTERVAL_MS / 1000}s</Text>
            </View>
          </View>
          <View style={styles.trafficChart}>
            <View
              style={[
                styles.peakZone,
                { left: '58%', width: '20%' },
              ]}>
              <Text style={[type.pill, { color: SKY.colors.tertiary, fontWeight: '700', letterSpacing: 1 }]}>PEAK</Text>
            </View>
            <TrafficCurve />
          </View>
          <View style={styles.trafficAxis}>
            <Text style={[type.telemetry, { color: SKY.colors.outline, fontSize: 10 }]}>00:00</Text>
            <Text style={[type.telemetry, { color: SKY.colors.outline, fontSize: 10 }]}>06:00</Text>
            <Text style={[type.telemetry, { color: SKY.colors.outline, fontSize: 10 }]}>12:00</Text>
            <Text style={[type.telemetry, { color: SKY.colors.tertiary, fontSize: 10, fontWeight: '600' }]}>16:00</Text>
            <Text style={[type.telemetry, { color: SKY.colors.outline, fontSize: 10 }]}>20:00</Text>
            <Text style={[type.telemetry, { color: SKY.colors.outline, fontSize: 10 }]}>23:59</Text>
          </View>
        </View>
      </View>

      {/* Aircraft category mix */}
      <View style={styles.section}>
        <View style={styles.sectionTop}>
          <View style={styles.sectionTitleRow}>
            <Icon name="pie-chart" size={18} color={SKY.colors.primary} />
            <Text style={[type.headlineMd, { color: SKY.colors.onSurface, textTransform: 'uppercase' }]}>
              Aircraft Category Mix
            </Text>
          </View>
          <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>AIRFRAME TYPES</Text>
        </View>
        <View style={styles.segBar}>
          <View style={[styles.segHeavy, { width: `${Math.max(0, d.categories[0].pct)}%` }]} />
          <View style={[styles.segNarrow, { width: `${Math.max(0, d.categories[1].pct)}%` }]} />
          <View style={[styles.segRegional, { width: `${Math.max(0, d.categories[2].pct)}%` }]} />
        </View>
        <View style={styles.categoryCol}>
          {d.categories.map((c) => (
            <View key={c.name} style={styles.categoryRow}>
              <View style={styles.categoryIcon}>
                <Icon name={c.icon} size={18} color={c.color} />
              </View>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryTitleRow}>
                  <View style={[styles.altDot, { backgroundColor: c.color }]} />
                  <Text style={[type.bodySm, { color: SKY.colors.onSurface, fontWeight: '600' }]}>{c.name}</Text>
                </View>
                <Text style={[type.telemetry, { color: SKY.colors.outline }]}>{c.models}</Text>
              </View>
              <View style={styles.categoryValue}>
                <Text style={[type.metricDisplay, { color: c.color, fontSize: 18, lineHeight: 22 }]}>
                  {d.total ? pct1(c.pct) : '—'}
                </Text>
                <Text style={[type.pill, { color: SKY.colors.outline }]}>{formatNum(c.count)} AC</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Dispatch ticker footer */}
      <View style={styles.dispatch}>
        <View style={styles.dispatchLeft}>
          <Icon name="sensors" size={16} color={SKY.colors.tertiary} />
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
            ADS-B RECEPTOR MATRIX:{' '}
            <Text style={{ color: SKY.colors.tertiary, fontWeight: '700' }}>
              {error ? 'FAULT' : d.total ? 'OPTIMAL' : 'STANDBY'}
            </Text>
          </Text>
        </View>
        <Text style={[type.pill, { color: SKY.colors.outline }]}>
          {updatedAt ? 'LATENCY: SYNCED' : 'LATENCY: —'}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: space.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  streamPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
  },
  streamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SKY.colors.tertiary,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.xs,
  },
  worldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  windowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    marginLeft: space.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  gridItem: {
    width: '47.5%',
    flexGrow: 1,
  },
  section: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.sm,
  },
  sectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  chartCol: {
    gap: space.sm,
  },
  chartRow: {
    gap: space.xxs,
  },
  countryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codePill: {
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingHorizontal: space.xxs,
    paddingVertical: 1,
    marginRight: space.xs,
  },
  countryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginLeft: 'auto',
  },
  altCol: {
    gap: space.xs,
  },
  altRow: {
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: space.sm,
    gap: space.xs,
  },
  altLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    justifyContent: 'space-between',
  },
  altDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: space.xs,
  },
  donutBox: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutLegend: {
    gap: space.xxs,
  },
  donutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  donutDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trafficWrap: {
    gap: space.xs,
  },
  trafficHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
  trafficChart: {
    height: 96,
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: space.xs,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  peakZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(82,232,124,0.1)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(82,232,124,0.3)',
    alignItems: 'center',
    paddingTop: 2,
  },
  trafficAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  segBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: radius.full,
    backgroundColor: SKY.colors.surfaceContainer,
    overflow: 'hidden',
  },
  segHeavy: {
    height: '100%',
    backgroundColor: SKY.colors.primary,
    borderTopLeftRadius: radius.full,
    borderBottomLeftRadius: radius.full,
  },
  segNarrow: {
    height: '100%',
    backgroundColor: SKY.colors.secondary,
  },
  segRegional: {
    height: '100%',
    backgroundColor: SKY.colors.tertiary,
    borderTopRightRadius: radius.full,
    borderBottomRightRadius: radius.full,
  },
  categoryCol: {
    gap: space.xs,
  },
  categoryRow: {
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(142,213,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    gap: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  categoryValue: {
    alignItems: 'flex-end',
  },
  dispatch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(33,42,57,0.6)',
    borderRadius: radius.lg,
    padding: space.sm,
  },
  dispatchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
});