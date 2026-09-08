import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompassGauge } from '@/components/skytrack/charts';
import { flightsToRadar, RadarFlight, RadarMap } from '@/components/skytrack/radar-map';
import { Screen } from '@/components/skytrack/screen';
import { Icon, PingingDot } from '@/components/skytrack/ui';
import { radius, SKY, space, type } from '@/constants/theme';
import { AVIA_DISPLAY, formatNum, progressFromAlt, vspLabel } from '@/lib/aviation';
import { useLiveFlights } from '@/lib/feed';

type Metric = {
  label: string;
  value: string;
  icon?: 'flight-takeoff' | 'flight-land' | null;
  sub?: string | null;
  color: string;
  trendColor: string;
  ping?: boolean;
  iconColor?: string;
  chip?: string;
};

function parseAlt(altFt: number) {
  const fl = Math.floor(altFt / 100);
  return { value: altFt.toLocaleString('en-US'), fl: String(fl).padStart(3, '0') };
}

export default function MapTrackerScreen() {
  const { flights, loading, error, latencyMs, simulated } = useLiveFlights();
  const [flightId, setFlightId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const radar = useMemo(() => flightsToRadar(flights), [flights]);
  const flight = radar.find((f) => f.callsign === flightId) ?? radar[0] ?? null;

  const total = flights.length;
  const airborne = flights.filter((f) => f.status === 'airborne').length;
  const ground = total - airborne;
  const airPct = total > 0 ? Math.round((airborne / total) * 1000) / 10 : 0;
  const gndPct = total > 0 ? Math.round((ground / total) * 1000) / 10 : 0;
  const online = total > 0;
  const feedValue = loading && !online ? 'SCANNING' : error ? 'OFFLINE' : online ? 'ACTIVE' : 'STANDBY';

  const metrics: Metric[] = [
    {
      label: 'AIRSPACE TOTAL',
      value: online ? formatNum(total) : '—',
      icon: null,
      sub: null,
      color: SKY.colors.primary,
      trendColor: SKY.colors.tertiary,
      ping: true,
      chip: error ? 'ERR' : 'LIVE',
    },
    {
      label: 'AIRBORNE SECTOR',
      value: formatNum(airborne),
      icon: 'flight-takeoff',
      sub: online ? `${airPct}% OF TRANSIT` : null,
      color: SKY.colors.onSurface,
      trendColor: SKY.colors.secondary,
    },
    {
      label: 'TAXI / SURFACE',
      value: formatNum(ground),
      icon: 'flight-land',
      sub: online ? `${gndPct}% OF TRANSIT` : null,
      color: SKY.colors.onSurfaceVariant,
      trendColor: SKY.colors.outline,
      iconColor: SKY.colors.outline,
    },
    {
      label: 'FEED SYNC',
      value: feedValue,
      icon: null,
      sub: simulated ? 'SIMULATED FEED' : AVIA_DISPLAY,
      color: SKY.colors.tertiary,
      trendColor: SKY.colors.onSurfaceVariant,
      chip: latencyMs !== null ? `${(latencyMs / 1000).toFixed(2)}s` : '—',
    },
  ];

  const selectFlight = useCallback((f: RadarFlight) => {
    setFlightId(f.callsign);
    setToast(`${f.callsign} telemetry linked`);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const callsign = flight?.callsign ?? '----';
  const airline = flight?.airline ?? '';
  const fullType = flight?.fullType ?? 'NO FEED';
  const airborneBadge = !flight ? 'STANDBY' : flight.ground ? 'ON GROUND' : 'AIRBORNE';

  const alt = flight ? parseAlt(flight.altFt) : { value: '0', fl: '000' };
  const spd = flight ? String(flight.speedKt) : '0';
  const vs = flight ? flight.vs.replace(' fpm', '') : '0';
  const vsIsDesc = flight ? flight.vs.startsWith('-') : false;
  const routePct = progressFromAlt(flight?.altFt ?? 0);
  const sqk = flight?.sqk ?? '----';
  const emgSquawk = ['7700', '7600', '7500'].includes(sqk);

  return (
    <Screen subtitle="Map Tracker">
      {/* Telemetry barometer carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -16 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}>
        {metrics.map((m) => (
          <View key={m.label} style={styles.metric}>
            <View style={styles.metricHead}>
              <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>{m.label}</Text>
              {m.ping ? <PingingDot size={6} /> : null}
              {m.icon ? (
                <Icon name={m.icon} size={14} color={m.iconColor ?? SKY.colors.primaryContainer} />
              ) : null}
            </View>
            <Text style={[type.metricDisplay, { color: m.color, marginTop: 4 }]}>{m.value}</Text>
            {m.chip ? (
              <Text style={[type.pill, { color: SKY.colors.tertiary }]}>{m.chip}</Text>
            ) : m.sub ? (
              <Text style={[type.telemetry, { color: m.trendColor }]}>{m.sub}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      {/* Interactive tactical map */}
      <RadarMap
        flights={radar}
        selected={callsign}
        onSelect={selectFlight}
      />

      {/* Telemetry in-flight detail sheet */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        {/* Sheet header */}
        <View style={styles.sheetHead}>
          <View style={styles.sheetId}>
            <View style={styles.sheetIcon}>
              <Icon name="flight" size={22} color={SKY.colors.primary} />
            </View>
            <View>
              <View style={styles.sheetTitleRow}>
                <Text style={[type.headlineLgMobile, { color: SKY.colors.onSurface, letterSpacing: -0.3 }]}>
                  {callsign}
                </Text>
                {flight ? (
                  <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
                    • {airline}
                  </Text>
                ) : null}
              </View>
              <Text style={[type.telemetry, { color: SKY.colors.secondary }]}>{fullType}</Text>
            </View>
          </View>
          <View style={styles.airborneBadge}>
            <PingingDot size={6} />
            <Text style={[type.pill, { color: SKY.colors.tertiary }]}>{airborneBadge}</Text>
          </View>
        </View>

        {/* Metadata strip */}
        <View style={styles.metaStrip}>
          {[
            { label: 'ICAO24', value: flight?.icao ?? '----', color: SKY.colors.onSurface },
            { label: 'ORIGIN / DEST', value: `${flight?.origin ?? '----'} → ${flight?.dest ?? '----'}`, color: SKY.colors.primary },
            { label: 'EST ARRIVAL', value: flight?.eta ?? '--:-- UTC', color: SKY.colors.onSurface },
          ].map((cell) => (
            <View key={cell.label} style={styles.metaCell}>
              <Text style={[type.pill, { color: SKY.colors.outline }]}>{cell.label}</Text>
              <Text style={[type.telemetry, { color: cell.color, marginTop: 2, fontWeight: '600' }]}>
                {cell.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Instrumentation cluster */}
        <View style={styles.instrumentRow}>
          <View style={styles.compassBox}>
            <View style={styles.compassInner}>
              <CompassGauge heading={flight?.heading ?? 0} size={88} />
            </View>
            <View style={styles.hdgPill}>
              <Text style={[type.pill, { color: SKY.colors.tertiary }]}>
                {flight ? `${flight.heading}° HDG` : '---° HDG'}
              </Text>
            </View>
          </View>
          <View style={styles.sensorGrid}>
            <View style={styles.sensor}>
              <Text style={[type.pill, { color: SKY.colors.outline }]}>ALTITUDE</Text>
              <View style={styles.sensorValue}>
                <Text style={[type.metricLabel, { color: SKY.colors.primary, fontWeight: '700' }]}>{alt.value}</Text>
                <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>FT</Text>
              </View>
              <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>FL{alt.fl} STD</Text>
            </View>
            <View style={styles.sensor}>
              <Text style={[type.pill, { color: SKY.colors.outline }]}>GROUND SPD</Text>
              <View style={styles.sensorValue}>
                <Text style={[type.metricLabel, { color: SKY.colors.onSurface, fontWeight: '700' }]}>{spd}</Text>
                <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>KT</Text>
              </View>
              <Text style={[type.telemetry, { color: SKY.colors.secondary }]}>GS {spd} kt</Text>
            </View>
            <View style={styles.sensor}>
              <Text style={[type.pill, { color: SKY.colors.outline }]}>VERT RATE</Text>
              <View style={styles.sensorValue}>
                <Text style={[type.metricLabel, { color: vsIsDesc ? SKY.colors.error : SKY.colors.tertiary, fontWeight: '700' }]}>{vs}</Text>
                <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>FPM</Text>
              </View>
              <Text style={[type.telemetry, { color: SKY.colors.tertiary }]}>
                {flight ? vspLabel(flight.vsFpm) : 'STANDBY'}
              </Text>
            </View>
            <View style={styles.sensor}>
              <Text style={[type.pill, { color: SKY.colors.outline }]}>TRANSPONDER</Text>
              <View style={styles.sensorValue}>
                <Text style={[type.metricLabel, { color: emgSquawk ? SKY.colors.error : SKY.colors.onSurface, fontWeight: '700' }]}>
                  {sqk}
                </Text>
                <Text style={[type.pill, { color: emgSquawk ? SKY.colors.error : SKY.colors.tertiary }]}>
                  {emgSquawk ? 'EMERG' : 'NORM'}
                </Text>
              </View>
              <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>MODE-S EHS</Text>
            </View>
          </View>
        </View>

        {/* Route progress strip */}
        <View style={styles.routeStrip}>
          <View style={styles.routeHead}>
            <Text style={[type.telemetry, { color: SKY.colors.onSurface, fontWeight: '500' }]}>
              {flight?.origin ?? '----'} (DEP)
            </Text>
            <Text style={[type.telemetry, { color: SKY.colors.primary }]}>
              {flight ? `${routePct}% SECTOR COMPLETE` : 'NO TARGET'}
            </Text>
            <Text style={[type.telemetry, { color: SKY.colors.onSurface, fontWeight: '500' }]}>
              {flight?.dest ?? '----'} (ARR)
            </Text>
          </View>
          <View style={styles.routeTrack}>
            <View style={[styles.routeFill, { width: `${routePct}%` }]} />
          </View>
          <View style={styles.routeFoxes}>
            <Text style={[type.pill, { color: SKY.colors.outline }]}>Passed: {flight?.origin ?? '----'}</Text>
            <Text style={[type.pill, { color: SKY.colors.outline }]}>Rem: {100 - routePct}%</Text>
            <Text style={[type.pill, { color: SKY.colors.outline }]}>Fix: {flight?.dest ?? '----'}</Text>
          </View>
        </View>

        {/* Tactical CTAs */}
        <Pressable style={styles.primaryCta}>
          <Icon name="center-focus-strong" size={18} color={SKY.colors.onPrimaryContainer} />
          <Text style={[type.headlineMd, { color: SKY.colors.onPrimaryContainer }]}>LOCK SATELLITE HUD</Text>
        </Pressable>
        <View style={styles.secondaryCtas}>
          <Pressable style={styles.secondaryCta}>
            <Icon name="radar" size={16} color={SKY.colors.primary} />
            <Text style={[type.telemetry, { color: SKY.colors.onSurface }]}>EMIT PING</Text>
          </Pressable>
          <Pressable style={styles.secondaryCta}>
            <Icon name="bookmark-add" size={16} color={SKY.colors.secondary} />
            <Text style={[type.telemetry, { color: SKY.colors.onSurface }]}>ADD WATCHLIST</Text>
          </Pressable>
        </View>
      </View>

      {/* Tactical toast */}
      {toast ? (
        <View style={styles.toast}>
          <Icon name="verified" size={16} color={SKY.colors.tertiary} />
          <Text style={[type.telemetry, { color: SKY.colors.primary }]}>{toast}</Text>
          <Pressable onPress={() => setToast(null)}>
            <Icon name="close" size={14} color={SKY.colors.onSurfaceVariant} />
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  metric: {
    width: 144,
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.xs,
    flexShrink: 0,
  },
  metricHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheet: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: space.lg,
    paddingBottom: space['2xl'],
    gap: space.md,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: SKY.colors.surfaceVariant,
    marginBottom: 2,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetId: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 1,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: SKY.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  airborneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainerHighest,
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
  },
  metaStrip: {
    flexDirection: 'row',
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: space.sm,
    gap: space.xs,
  },
  metaCell: {
    flex: 1,
  },
  instrumentRow: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
  },
  compassBox: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: SKY.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hdgPill: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: 'rgba(44,53,69,0.9)',
    paddingHorizontal: 2,
    borderRadius: radius.sm,
  },
  sensorGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  sensor: {
    backgroundColor: SKY.colors.surfaceContainer,
    padding: space.xs,
    borderRadius: radius.sm,
    minWidth: '47%',
    flexGrow: 1,
  },
  sensorValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xxs,
  },
  routeStrip: {
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: space.xs,
    gap: space.xxs,
  },
  routeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: SKY.colors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  routeFill: {
    height: '100%',
    backgroundColor: SKY.colors.primary,
    borderRadius: 3,
  },
  routeFoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    backgroundColor: SKY.colors.primaryContainer,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
  },
  secondaryCtas: {
    flexDirection: 'row',
    gap: space.xs,
  },
  secondaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingVertical: space.xs,
  },
  toast: {
    position: 'absolute',
    top: 76,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: 'rgba(44,53,69,0.92)',
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});