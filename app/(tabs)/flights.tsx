import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DensitySparkline } from '@/components/skytrack/charts';
import { Screen } from '@/components/skytrack/screen';
import { Icon, PingingDot, Pill, ProgressBar } from '@/components/skytrack/ui';
import { radius, SKY, space, type } from '@/constants/theme';
import { flagEmoji, formatNum, LiveFlight, progressFromAlt } from '@/lib/aviation';
import { FEED_INTERVAL_MS, useLiveFlights } from '@/lib/feed';

type Flight = {
  callsign: string;
  airline: string;
  flag: string;
  icao: string;
  model: string;
  accent: string;
  accentDim?: boolean;
  route?: [string, string];
  corridor?: string;
  eet?: string;
  rem?: string;
  cruising?: string;
  progress?: number;
  gauges: { label: string; value: string; unit: string; color: string; rotate?: number }[];
  highlighted?: boolean;
  floor?: string;
  status?: 'airborne' | 'ground';
  ground?: string;
  gate?: string;
  gndSpd?: string;
  ago: string;
};

function ago(updated: number): string {
  if (!updated) return 'live';
  const s = Math.max(0, Math.round(Date.now() / 1000 - updated));
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m${s % 60 ? ` ${s % 60}s` : ''} ago`;
}

function toFlight(f: LiveFlight): Flight {
  const airborne = f.status === 'airborne';
  const altLabel = `FL${Math.floor(Math.max(0, f.altFt) / 100)}`;
  return {
    callsign: f.callsign || '----',
    airline: f.airlineIcao || '----',
    flag: flagEmoji(f.flag),
    icao: f.hex || '----',
    model: f.aircraftIcao ? f.aircraftIcao.toUpperCase() : 'ADS-B SQR',
    accent: airborne ? SKY.colors.primary : SKY.colors.surfaceBright,
    accentDim: !airborne,
    route: f.dep !== '----' && f.arr !== '----' ? [f.dep, f.arr] : undefined,
    corridor: airborne ? 'Live ADS-B Track' : 'Ground Ops',
    eet: `${altLabel} ALT`,
    cruising: 'LIVE TRACK',
    rem: `GS ${Math.round(f.speedKt)} KT`,
    progress: progressFromAlt(f.altFt),
    gauges: airborne
      ? [
          { label: 'ALT', value: String(Math.round(f.altFt)), unit: 'ft', color: SKY.colors.primary },
          { label: 'SPD', value: String(Math.round(f.speedKt)), unit: 'kt', color: SKY.colors.onSurface },
          { label: 'HDG', value: `${Math.round(f.heading % 360)}\u00B0`, unit: '', color: SKY.colors.onSurface, rotate: Math.round(f.heading % 360) },
          {
            label: 'V/S',
            value: `${f.vsFpm > 0 ? '+' : ''}${Math.round(f.vsFpm)}`,
            unit: 'fpm',
            color: f.vsFpm < -200 ? SKY.colors.error : SKY.colors.tertiary,
          },
        ]
      : [],
    status: airborne ? 'airborne' : 'ground',
    ground: 'Ground Ops',
    gate: '----',
    gndSpd: `${Math.round(f.speedKt)} kt`,
    ago: ago(f.updated),
  };
}

const FED_SHOWN = 40;

const FILTERS = [
  { label: 'STATUS: ALL', chevron: true, active: false },
  { label: 'ALT: >30,000 FT', close: true, active: true },
  { label: 'REGION: GLOBAL', chevron: true, active: false },
  { label: 'CARRIER: ALL', chevron: true, active: false },
  { label: 'MORE', tune: true, active: false, secondary: true },
];

function Gauge({ item }: { item: Flight['gauges'][number] }) {
  return (
    <View style={styles.gauge}>
      <Text style={[type.pill, { color: SKY.colors.outline }]}>{item.label}</Text>
      <View style={styles.gaugeValue}>
        {item.rotate !== undefined ? (
          <View style={{ transform: [{ rotate: `${item.rotate}deg` }], marginRight: 2 }}>
            <Icon name="navigation" size={13} color={SKY.colors.secondary} />
          </View>
        ) : null}
        <Text style={[type.metricLabel, { color: item.color }]}>{item.value}</Text>
        {item.unit ? (
          <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant, fontWeight: '400' }]}>{item.unit}</Text>
        ) : null}
      </View>
    </View>
  );
}

function FlightCard({ f }: { f: Flight }) {
  const ground = f.status === 'ground';
  return (
    <View style={[styles.card, f.highlighted && styles.cardHighlight]}>
      <View style={[styles.cardAccent, { backgroundColor: f.accent, opacity: f.accentDim ? 0.6 : 1 }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardId}>
            <View style={styles.cardTitleRow}>
              <Text style={[type.headlineMd, { color: f.highlighted ? SKY.colors.primary : SKY.colors.onSurface, fontWeight: '700', letterSpacing: -0.3 }]}>
                {f.callsign}
              </Text>
              <Pill text={f.airline} bg={SKY.colors.surfaceContainerHighest} color={SKY.colors.onSurface} style={styles.cardAirline} />
              <Text style={{ fontSize: 13 }}>{f.flag}</Text>
            </View>
            <View style={styles.cardSubRow}>
              <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>ICAO: {f.icao}</Text>
              <Text style={[type.pill, { color: SKY.colors.outline }]}>•</Text>
              <Text style={[type.telemetry, { color: SKY.colors.secondary, fontWeight: '500' }]}>{f.model}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.statusPill}>
              <PingingDot size={6} />
              <Text style={[type.pill, { color: SKY.colors.tertiary, fontWeight: '700' }]}>
                {ground ? 'ON GROUND' : 'AIRBORNE'}
              </Text>
            </View>
            <Text style={[type.pill, { color: SKY.colors.outline, marginTop: 2 }]}>{f.ago}</Text>
          </View>
        </View>

        {f.highlighted ? (
          <View style={styles.routeGraphic}>
            <View style={styles.routeEndpoints}>
              <View>
                <Text style={[type.metricLabel, { color: SKY.colors.onSurface, fontWeight: '700' }]}>{f.route?.[0]}</Text>
                <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>DEPARTURE</Text>
              </View>
              <View style={styles.routeMid}>
                <View style={styles.routeLabels}>
                  <Text style={[type.pill, { color: SKY.colors.primary }]}>{f.eet}</Text>
                  <Text style={[type.pill, { color: SKY.colors.tertiary, fontWeight: '700' }]}>{f.cruising}</Text>
                  <Text style={[type.pill, { color: SKY.colors.primary }]}>{f.rem}</Text>
                </View>
                <ProgressBar pct={f.progress ?? 0} height={6} color={SKY.colors.primaryContainer} />
              </View>
              <View style={styles.routeEndRight}>
                <Text style={[type.metricLabel, { color: SKY.colors.onSurface, fontWeight: '700' }]}>{f.route?.[1]}</Text>
                <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>ARRIVAL</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.sectorRoute}>
            <Text style={[type.metricLabel, { color: SKY.colors.primary, fontWeight: '700' }]}>{f.route?.[0]}</Text>
            <Icon name="arrow-forward" size={14} color={SKY.colors.outline} />
            <Text style={[type.metricLabel, { color: SKY.colors.onSurface, fontWeight: '700' }]}>{f.route?.[1]}</Text>
            <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant, marginLeft: space.xs }]}>{f.corridor}</Text>
          </View>
        )}

        {ground ? (
          <View style={styles.groundRow}>
            <Icon name="local-taxi" size={16} color={SKY.colors.surfaceBright} />
            <Text style={[type.metricLabel, { color: SKY.colors.onSurface, fontWeight: '600' }]}>{f.ground}</Text>
            <Pill text={f.gate ?? ''} bg={SKY.colors.surfaceContainerHigh} color={SKY.colors.onSurfaceVariant} />
            <View style={styles.gndSpd}>
              <Text style={[type.pill, { color: SKY.colors.outline }]}>GND SPD</Text>
              <Text style={[type.metricLabel, { color: SKY.colors.primary, fontWeight: '700' }]}>{f.gndSpd}</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.gaugeRow, f.highlighted && { marginTop: space.sm }]}>
              {f.gauges.map((g) => (
                <Gauge key={g.label} item={g} />
              ))}
            </View>
            {f.highlighted ? (
              <View style={styles.cardActions}>
                <Pressable style={styles.radarBtn}>
                  <Icon name="radar" size={16} color={SKY.colors.onPrimary} />
                  <Text style={[type.pill, { color: SKY.colors.onPrimary, fontWeight: '700' }]}>RADAR VIEW</Text>
                </Pressable>
                <Pressable style={styles.trackBtn}>
                  <Icon name="location-searching" size={16} color={SKY.colors.primary} />
                  <Text style={[type.pill, { color: SKY.colors.primary, fontWeight: '700' }]}>TRACK FLIGHT</Text>
                </Pressable>
                <Pressable style={styles.starBtn}>
                  <Icon name="star" size={18} color={SKY.colors.onSurfaceVariant} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.compactActions}>
                <Pressable style={styles.compactBtn}>
                  <Text style={[type.pill, { color: SKY.colors.primary }]}>RADAR VIEW</Text>
                </Pressable>
                <Pressable style={styles.compactBtn}>
                  <Text style={[type.pill, { color: SKY.colors.secondary }]}>TRACK FLIGHT</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

export default function FlightsScreen() {
  const { flights, loading, error } = useLiveFlights();
  const [state, setState] = useState<string>('airborne');

  const { airborne, onGround, feed, watched, total } = useMemo(() => {
    const air = flights.filter((f) => f.status === 'airborne');
    const gnd = flights.filter((f) => f.status === 'ground');
    const airCards = air.map(toFlight);
    const gndCards = gnd.map(toFlight);
    if (airCards.length > 0) airCards[0] = { ...airCards[0], highlighted: true };
    return {
      airborne: airCards,
      onGround: gndCards,
      feed: [...airCards, ...gndCards].slice(0, FED_SHOWN),
      watched: airCards.slice(0, 9),
      total: flights.length,
    };
  }, [flights]);

  const pages = Math.max(1, Math.ceil(total / FED_SHOWN));
  const STATE_TABS = [
    { key: 'airborne', label: `AIRBORNE (${airborne.length})`, icon: 'flight-takeoff' as const },
    { key: 'ground', label: `GROUND (${onGround.length})`, icon: 'flight-land' as const },
    { key: 'watched', label: `WATCHED (${watched.length})`, icon: 'star' as const },
  ];

  const shown = state === 'ground' ? onGround : state === 'watched' ? watched : feed;

  return (
    <Screen subtitle="Flight Registry">
      {/* Overview tactical ribbon */}
      <View style={styles.ribbon}>
        <View style={styles.ribbonTop}>
          <View style={styles.ribbonTitleRow}>
            <Text style={[type.headlineLgMobile, { color: SKY.colors.primary, textTransform: 'uppercase', letterSpacing: -0.3 }]}>
              Live Airspace Registry
            </Text>
            <Pill text="GLOBAL-NET" bg="rgba(3,181,211,0.2)" color={SKY.colors.secondary} style={styles.ribbonBadge} bold />
          </View>
          <View style={styles.ribbonSync}>
            <PingingDot size={8} />
            <Text style={[type.pill, { color: SKY.colors.tertiary }]}>{total ? `${formatNum(total)} SYNC` : 'NO FEED'}</Text>
          </View>
        </View>
        <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant, marginTop: 2 }]}>
          Real-time telemetry of {total ? formatNum(total) : '0'} active aircraft in monitored sectors
        </Text>
        <View style={styles.density}>
          <View>
            <Text style={[type.pill, { color: SKY.colors.outline }]}>TRANSPONDER CONTACTS</Text>
            <Text style={[type.metricLabel, { color: SKY.colors.primary, fontWeight: '700' }]}>
              {total ? formatNum(total) : '—'} AC
            </Text>
          </View>
          <View style={styles.spark}>
            <DensitySparkline />
          </View>
          <View style={styles.satPill}>
            <Icon name="satellite-alt" size={14} color={SKY.colors.tertiary} />
            <Text style={[type.pill, { color: SKY.colors.tertiary }]}>{error ? 'LINKS DOWN' : loading && !total ? 'SYNCING' : 'FEED OK'}</Text>
          </View>
        </View>
      </View>

      {/* Segmented state filter */}
      <View style={styles.stateTabs}>
        {STATE_TABS.map((t) => {
          const active = t.key === state;
          return (
            <Pressable
              key={t.key}
              onPress={() => setState(t.key)}
              style={[styles.stateTab, active && styles.stateTabActive]}>
              <Icon name={t.icon} size={16} color={active ? SKY.colors.primary : SKY.colors.onSurfaceVariant} />
              <Text style={[type.pill, { color: active ? SKY.colors.primary : SKY.colors.onSurfaceVariant, fontWeight: active ? '700' : '400' }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Filter pills */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.xs }}>
          {FILTERS.map((flt, i) => (
            <View
              key={i}
              style={[
                styles.filterPill,
                flt.active && { backgroundColor: SKY.colors.primaryContainer },
                flt.secondary && { backgroundColor: SKY.colors.surfaceContainerHighest },
              ]}>
              <Text
                style={[
                  type.pill,
                  {
                    color: flt.active
                      ? SKY.colors.onPrimaryContainer
                      : flt.secondary
                        ? SKY.colors.secondary
                        : SkyFilterColor(flt),
                  },
                ]}>
                {flt.label}
              </Text>
              {flt.chevron ? <Icon name="expand-more" size={14} color={SKY.colors.onSurfaceVariant} /> : null}
              {flt.close ? <Icon name="close" size={14} color={SKY.colors.onPrimaryContainer} /> : null}
              {flt.tune ? <Icon name="tune" size={14} color={SKY.colors.secondary} /> : null}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Telemetry cards feed */}
      {!loading && !error && total === 0 ? (
        <View style={styles.noFeed}>
          <Text style={[type.headlineMd, { color: SKY.colors.tertiary, textTransform: 'uppercase' }]}>
            NO TRANSPONDER FEED
          </Text>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
            Feed empty — waiting for live broadcasts
          </Text>
        </View>
      ) : (
        <View style={styles.feed}>
          {shown.map((f) => (
            <FlightCard key={f.callsign} f={f} />
          ))}
        </View>
      )}

      {/* Realtime stream footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View style={styles.footerShowing}>
            <Icon name="sync" size={14} color={SKY.colors.tertiary} />
            <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
              Showing <Text style={{ color: SKY.colors.onSurface, fontWeight: '700' }}>{shown.length}</Text> of{' '}
              <Text style={{ color: SKY.colors.onSurface, fontWeight: '700' }}>{total || 0}</Text> aircraft
            </Text>
          </View>
          <View style={styles.cycle}>
            <Text style={[type.pill, { color: SKY.colors.outline }]}>CYCLE:</Text>
            <Text style={[type.pill, { color: SKY.colors.primary, fontWeight: '700' }]}>
              {FEED_INTERVAL_MS / 1000}s
            </Text>
          </View>
        </View>
        <View style={styles.footerRow2}>
          <View style={styles.relay}>
            <Icon name="hub" size={13} color={SKY.colors.secondary} />
            <Text style={[type.pill, { color: SKY.colors.outline }]}>
              {error ? 'Feed interrupted — retrying' : 'Live feed relay active'}
            </Text>
          </View>
          <View style={styles.pagination}>
            <Pressable style={styles.pageBtn}>
              <Text style={[type.pill, { color: SKY.colors.onSurface }]}>PREV</Text>
            </Pressable>
            <Text style={[type.pill, { color: SKY.colors.primary }]}>PAGE 1 / {pages}</Text>
            <Pressable style={styles.pageBtn}>
              <Text style={[type.pill, { color: SKY.colors.primary }]}>NEXT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function SkyFilterColor(flt: { active: boolean; secondary?: boolean }) {
  if (flt.active) return SKY.colors.onPrimaryContainer;
  return SKY.colors.onSurfaceVariant;
}

const styles = StyleSheet.create({
  ribbon: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 2,
  },
  ribbonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ribbonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    flexShrink: 1,
  },
  ribbonBadge: {
    borderRadius: radius.sm,
  },
  ribbonSync: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  density: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5,14,28,0.6)',
    borderRadius: radius.sm,
    padding: space.xs,
    marginTop: space.sm,
  },
  spark: {
    width: 112,
    height: 24,
  },
  satPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: 'rgba(44,203,99,0.2)',
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
  },
  stateTabs: {
    flexDirection: 'row',
    backgroundColor: SKY.colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: space.xxs,
    gap: space.xxs,
  },
  stateTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingVertical: space.xs,
    borderRadius: radius.lg,
  },
  stateTabActive: {
    backgroundColor: SKY.colors.surfaceContainerHigh,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    flexShrink: 0,
  },
  feed: {
    gap: space.sm,
  },
  noFeed: {
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  card: {
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHighlight: {
    backgroundColor: SKY.colors.surfaceContainer,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: space.md,
    paddingLeft: space.sm,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  cardId: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  cardAirline: {
    borderRadius: radius.sm,
  },
  cardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: 'rgba(44,203,99,0.3)',
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
  },
  routeGraphic: {
    backgroundColor: 'rgba(5,14,28,0.8)',
    borderRadius: radius.sm,
    padding: space.sm,
    marginTop: space.sm,
  },
  routeEndpoints: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeMid: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    gap: 2,
  },
  routeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  routeEndRight: {
    alignItems: 'flex-end',
  },
  sectorRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.sm,
  },
  groundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: SKY.colors.surfaceContainerLowest,
    borderRadius: radius.sm,
    padding: space.xs,
    marginTop: space.sm,
  },
  gndSpd: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xxs,
    marginLeft: 'auto',
  },
  gaugeRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  gauge: {
    flex: 1,
    backgroundColor: SKY.colors.surfaceContainerLow,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  gaugeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    marginTop: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
  },
  radarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    backgroundColor: SKY.colors.primary,
    borderRadius: radius.sm,
    paddingVertical: space.xs,
  },
  trackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingVertical: space.xs,
  },
  starBtn: {
    width: 32,
    height: 32,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space.xs,
    marginTop: space.sm,
  },
  compactBtn: {
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  footer: {
    backgroundColor: SKY.colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: space.sm,
    gap: space.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerShowing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  cycle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
  footerRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  pageBtn: {
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
  },
});