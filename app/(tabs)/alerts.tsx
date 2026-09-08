import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/skytrack/screen';
import {
  Icon,
  PingingDot,
  Pill,
  Segmented,
  SettingRow,
  Toggle,
} from '@/components/skytrack/ui';
import { radius, SKY, space, type } from '@/constants/theme';
import { AVIA_DISPLAY, LiveFlight, progressFromAlt } from '@/lib/aviation';
import { useLiveFlights } from '@/lib/feed';

type Panel = 'alerts' | 'watchlist' | 'settings';

type AlertCardData = {
  title: string;
  desc: string;
  icon: 'emergency' | 'speed' | 'vertical-align-top';
  iconBg: string;
  iconColor: string;
  pill: string;
  pillBg: string;
  pillColor: string;
  state: string;
  cells: { label: string; value: string }[];
  ago: string;
  actions: { label: string; color: string }[];
};

type Watched = {
  id: string;
  type: string;
  airline: string;
  alt: string;
  spd: string;
  route: string;
  progress: number;
  barColor: string;
};

const EMER_SQUAWKS = ['7700', '7600', '7500'];
const OVERSPEED_KT = 520;
const CEILING_ALT_FT = 41000;

function deriveAlerts(
  flights: LiveFlight[],
  pingSecs: number | null,
): { alerts: AlertCardData[]; triggered: number; watched: Watched[] } {
  const emg = flights.filter((f) => EMER_SQUAWKS.includes(f.squawk));
  const overspeed = flights.filter((f) => f.status === 'airborne' && f.speedKt > OVERSPEED_KT);
  const ceiling = flights.filter((f) => f.altFt > CEILING_ALT_FT);
  const ago = pingSecs === null ? 'Last ping: —' : `Last ping check: ${pingSecs}s ago`;

  const targets = (list: LiveFlight[]) =>
    list.length ? list.slice(0, 3).map((f) => f.callsign || '----').join(', ') : 'NONE DETECTED';

  const alerts: AlertCardData[] = [
    {
      title: 'Squawk 7700 / 7600 / 7500',
      desc: 'General Emergency • Radio Fail • Unlawful Interference',
      icon: 'emergency',
      iconBg: 'rgba(147,0,10,0.9)',
      iconColor: SKY.colors.error,
      pill: emg.length ? 'CRITICAL' : 'ARMED',
      pillBg: emg.length ? SKY.colors.errorContainer : SKY.colors.surfaceContainerHighest,
      pillColor: emg.length ? SKY.colors.onErrorContainer : SKY.colors.secondary,
      state: emg.length ? 'ACTIVE' : 'ARMED',
      cells: [
        { label: 'TARGET FLIGHTS', value: targets(emg) },
        { label: 'SCOPE', value: 'Global Airspace' },
      ],
      ago,
      actions: [
        { label: 'MUTED', color: SKY.colors.onSurface },
        { label: 'DISARM', color: SKY.colors.error },
      ],
    },
    {
      title: 'Speed Deviation: > 520 kt',
      desc: 'High-speed mach barrier safety envelope',
      icon: 'speed',
      iconBg: SKY.colors.secondaryContainer,
      iconColor: SKY.colors.onSecondaryContainer,
      pill: overspeed.length ? 'OVERSPEED' : 'MONITORING',
      pillBg: overspeed.length ? SKY.colors.errorContainer : SKY.colors.surfaceContainerHighest,
      pillColor: overspeed.length ? SKY.colors.onErrorContainer : SKY.colors.secondary,
      state: overspeed.length ? 'ACTIVE' : 'MONITORING',
      cells: [
        { label: 'TARGET FLIGHTS', value: targets(overspeed) },
        { label: 'THRESHOLD', value: `${OVERSPEED_KT} kts GS` },
      ],
      ago,
      actions: [
        { label: 'EDIT', color: SKY.colors.onSurface },
        { label: 'PAUSE', color: SKY.colors.onSurfaceVariant },
      ],
    },
    {
      title: 'Altitude Ceiling: FL410+',
      desc: 'Upper Stratosphere Clearance Limit',
      icon: 'vertical-align-top',
      iconBg: SKY.colors.surfaceContainerHighest,
      iconColor: SKY.colors.primary,
      pill: ceiling.length ? 'BOUNDARY' : 'ARMED',
      pillBg: ceiling.length ? SKY.colors.errorContainer : SKY.colors.surfaceContainerHighest,
      pillColor: ceiling.length ? SKY.colors.onErrorContainer : SKY.colors.primaryFixed,
      state: ceiling.length ? 'ACTIVE' : 'ARMED',
      cells: [
        { label: 'TARGET FLIGHTS', value: targets(ceiling) },
        { label: 'ACTION', value: 'Log & Dispatch Alert' },
      ],
      ago,
      actions: [
        { label: 'CONFIG', color: SKY.colors.onSurface },
        { label: 'DISARM', color: SKY.colors.error },
      ],
    },
  ];

  const watched: Watched[] = flights
    .filter((f) => f.status === 'airborne')
    .slice(0, 3)
    .map((f, i) => ({
      id: f.callsign || '----',
      type: f.aircraftIcao ? f.aircraftIcao.toUpperCase() : 'UNK',
      airline: f.airlineIcao || '----',
      alt: `FL${Math.floor(Math.max(0, f.altFt) / 100)}`,
      spd: `${Math.round(f.speedKt)} kt`,
      route: `${f.dep} ➔ ${f.arr}`,
      progress: progressFromAlt(f.altFt),
      barColor: [SKY.colors.primary, SKY.colors.secondary, SKY.colors.tertiary][i % 3],
    }));

  return { alerts, triggered: emg.length + overspeed.length + ceiling.length, watched };
}

function AlertCard({ a }: { a: AlertCardData }) {
  return (
    <View style={styles.alertCard}>
      <View style={styles.alertHead}>
        <View style={styles.alertHeadLeft}>
          <View style={[styles.alertIcon, { backgroundColor: a.iconBg }]}>
            <Icon name={a.icon} size={18} color={a.iconColor} />
          </View>
          <View style={styles.alertTitleBlock}>
            <View style={styles.alertTitleRow}>
              <Text style={[type.headlineMd, { color: SKY.colors.onSurface, fontWeight: '600' }]} numberOfLines={1}>
                {a.title}
              </Text>
              <Pill text={a.pill} bg={a.pillBg} color={a.pillColor} style={styles.alertPill} />
            </View>
            <Text style={[type.bodySm, { color: SKY.colors.onSurfaceVariant }]}>{a.desc}</Text>
          </View>
        </View>
        <View style={styles.stateBadge}>
          <PingingDot size={6} />
          <Text style={[type.pill, { color: SKY.colors.tertiary }]}>{a.state}</Text>
        </View>
      </View>
      <View style={styles.cellRow}>
        {a.cells.map((c) => (
          <View key={c.label} style={styles.cell}>
            <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>{c.label}</Text>
            <Text style={[type.metricLabel, { color: SKY.colors.primary }]} numberOfLines={1}>
              {c.value}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.alertFoot}>
        <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>{a.ago}</Text>
        <View style={styles.alertActions}>
          {a.actions.map((act) => (
            <Pressable key={act.label} style={styles.alertAction}>
              <Text style={[type.pill, { color: act.color }]}>{act.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function WatchedCard({ w, onUntrack }: { w: Watched; onUntrack: () => void }) {
  return (
    <View style={styles.watchCard}>
      <View style={styles.watchHead}>
        <View style={styles.watchId}>
          <View style={styles.watchIcon}>
            <Icon name="flight" size={20} color={SKY.colors.primary} />
          </View>
          <View>
            <View style={styles.watchTitleRow}>
              <Text style={[type.headlineMd, { color: SKY.colors.onSurface }]}>{w.id}</Text>
              <Pill text={w.type} bg={SKY.colors.surfaceContainerHighest} color={SKY.colors.onSurfaceVariant} />
            </View>
            <Text style={[type.bodySm, { color: SKY.colors.onSurfaceVariant }]}>{w.airline}</Text>
          </View>
        </View>
        <Pressable onPress={onUntrack} style={styles.untrack}>
          <Text style={[type.pill, { color: SKY.colors.error }]}>UNTRACK</Text>
        </Pressable>
      </View>
      <View style={styles.watchCells}>
        <View style={styles.watchCell}>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>ALTITUDE</Text>
          <Text style={[type.metricDisplay, { color: SKY.colors.primary, fontSize: 18, lineHeight: 22 }]}>{w.alt}</Text>
        </View>
        <View style={styles.watchCell}>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>SPEED</Text>
          <Text style={[type.metricDisplay, { color: SKY.colors.secondary, fontSize: 18, lineHeight: 22 }]}>{w.spd}</Text>
        </View>
        <View style={styles.watchCell}>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>ROUTING</Text>
          <Text style={[type.metricLabel, { color: SKY.colors.tertiary, fontWeight: '700' }]}>{w.route}</Text>
        </View>
      </View>
      <View style={styles.watchProgressTrack}>
        <View style={[styles.watchProgressFill, { width: `${w.progress}%`, backgroundColor: w.barColor }]} />
      </View>
    </View>
  );
}

function SettingsView({
  latencyMs,
  error,
}: {
  latencyMs: number | null;
  error: string | null;
}) {
  const [reconnect, setReconnect] = useState(true);
  const [labels, setLabels] = useState(true);
  const [trail, setTrail] = useState(true);
  const [clustering, setClustering] = useState(true);
  const [refresh, setRefresh] = useState('60s (Nominal)');
  const [altUnit, setAltUnit] = useState<'FEET (FT)' | 'METERS (M)'>('FEET (FT)');
  const [spdUnit, setSpdUnit] = useState<'KNOTS (KT)' | 'KM/H' | 'MACH'>('KNOTS (KT)');
  const [coordUnit, setCoordUnit] = useState<'DECIMAL (DD)' | 'DMS (DEG/MIN/SEC)'>('DECIMAL (DD)');

  return (
    <View style={styles.settingsView}>
      {/* LIVE DATA RELAY */}
      <View style={styles.settingsModule}>
        <View style={styles.settingsModuleHead}>
          <Text style={[type.pill, { color: SKY.colors.primary, fontWeight: '600' }]}>LIVE DATA RELAY</Text>
          <View style={styles.modulePing}>
            <View style={[styles.streamDot, error && { backgroundColor: SKY.colors.error }]} />
            <Text style={[type.telemetry, { color: SKY.colors.tertiary }]}>
              {latencyMs !== null ? `${latencyMs}ms` : '—'} ping
            </Text>
          </View>
        </View>
        <SettingRow
          title="REST Stream Engine"
          description={AVIA_DISPLAY}
          control={
            error ? (
              <Pill text="OFFLINE" bg={SKY.colors.errorContainer} color={SKY.colors.onErrorContainer} />
            ) : (
              <Pill text="ONLINE" bg={SKY.colors.tertiaryContainer} color={SKY.colors.onTertiaryContainer} />
            )
          }
        />
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={[type.bodyMd, { color: SKY.colors.onSurface }]}>Refresh Interval</Text>
            <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>Transponder polling frequency</Text>
          </View>
          <View style={styles.selectBox}>
            <Segmented
              options={[
                { key: '15s (High load)', label: '15s' },
                { key: '30s (Normal)', label: '30s' },
                { key: '60s (Nominal)', label: '60s' },
              ]}
              active={refresh as '60s (Nominal)'}
              onSelect={setRefresh}
            />
          </View>
        </View>
        <SettingRow
          title="Auto-Reconnect"
          description="Resume on socket dropout"
          control={<Toggle value={reconnect} onValueChange={setReconnect} />}
        />
      </View>

      {/* RADAR DISPLAY CALIBRATION */}
      <View style={styles.settingsModule}>
        <View style={styles.settingsModuleHead}>
          <Text style={[type.pill, { color: SKY.colors.primary, fontWeight: '600' }]}>RADAR DISPLAY CALIBRATION</Text>
          <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>HUD LAYER 2</Text>
        </View>
        <SettingRow
          title="Tactical Night HUD"
          description="High-contrast photon palette"
          control={<Pill text="ACTIVE" bg={SKY.colors.primaryContainer} color={SKY.colors.onPrimaryContainer} />}
        />
        <SettingRow
          title="Aircraft Labels"
          description="Display Callsign + FL on map icons"
          control={<Toggle value={labels} onValueChange={setLabels} />}
        />
        <SettingRow
          title="Flight Trail Trajectory"
          description="Vector breadcrumbs (15m history)"
          control={<Toggle value={trail} onValueChange={setTrail} />}
        />
        <SettingRow
          title="Aircraft Clustering"
          description="Condense high-density terminal sectors"
          control={<Toggle value={clustering} onValueChange={setClustering} />}
        />
      </View>

      {/* UNITS OF MEASURE */}
      <View style={styles.settingsModule}>
        <View style={styles.settingsModuleHead}>
          <Text style={[type.pill, { color: SKY.colors.primary, fontWeight: '600' }]}>UNITS OF MEASURE</Text>
          <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>ICAO / FAA STANDARD</Text>
        </View>
        <View style={styles.unitBlock}>
          <Text style={[type.bodyMd, { color: SKY.colors.onSurface }]}>Altitude Display</Text>
          <Segmented
            options={[
              { key: 'FEET (FT)', label: 'FEET (FT)' },
              { key: 'METERS (M)', label: 'METERS (M)' },
            ]}
            active={altUnit}
            onSelect={setAltUnit}
          />
        </View>
        <View style={styles.unitBlock}>
          <Text style={[type.bodyMd, { color: SKY.colors.onSurface }]}>Ground Speed</Text>
          <Segmented
            options={[
              { key: 'KNOTS (KT)', label: 'KNOTS (KT)' },
              { key: 'KM/H', label: 'KM/H' },
              { key: 'MACH', label: 'MACH' },
            ]}
            active={spdUnit}
            onSelect={setSpdUnit}
          />
        </View>
        <View style={styles.unitBlock}>
          <Text style={[type.bodyMd, { color: SKY.colors.onSurface }]}>Geographic Coordinates</Text>
          <Segmented
            options={[
              { key: 'DECIMAL (DD)', label: 'DECIMAL (DD)' },
              { key: 'DMS (DEG/MIN/SEC)', label: 'DMS (DEG/MIN/SEC)' },
            ]}
            active={coordUnit}
            onSelect={setCoordUnit}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.settingsFooter}>
        <View style={styles.footerRow}>
          <View style={styles.connected}>
            <View style={[styles.streamDot, error && { backgroundColor: SKY.colors.error }]} />
            <Text style={[type.telemetry, { color: SKY.colors.tertiary }]}>
              {error ? 'RECONNECTING' : `CONNECTED (${latencyMs ?? '—'}ms)`}
            </Text>
          </View>
          <View style={styles.encrypted}>
            <Icon name="lock" size={14} color={SKY.colors.onSurfaceVariant} />
            <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>TLS 1.3 ENCRYPTED</Text>
          </View>
        </View>
        <View style={styles.footerRow}>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
            Gateway: skytrack-relay-node-01
          </Text>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>PORT 443</Text>
        </View>
      </View>
    </View>
  );
}

export default function AlertsScreen() {
  const { flights, loading, error, latencyMs, updatedAt } = useLiveFlights();
  const [panel, setPanel] = useState<Panel>('alerts');
  const untracked = useRef<Set<string>>(new Set());

  const { alerts, triggered, watched: watchedAll } = useMemo(() => {
    const pingSecs =
      updatedAt !== null ? Math.max(0, Math.round((Date.now() - updatedAt) / 1000)) : null;
    return deriveAlerts(flights, pingSecs);
  }, [flights, updatedAt]);

  const watched = watchedAll.filter((w) => !untracked.current.has(w.id));

  const TABS: { key: Panel; label: string; icon: 'warning' | 'bookmark' | 'display-settings' }[] = [
    { key: 'alerts', label: `ALERTS (${triggered})`, icon: 'warning' },
    { key: 'watchlist', label: `WATCHLIST (${watched.length})`, icon: 'bookmark' },
    { key: 'settings', label: 'SETTINGS', icon: 'display-settings' },
  ];

  const syncState = error
    ? 'Link fault — auto reconnect'
    : loading && !flights.length
      ? 'Scanning transponder arrays…'
      : 'All transponder listening arrays synchronized';

  return (
    <Screen subtitle="Tactical Alerts">
      {/* Sub-navigation tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = t.key === panel;
          return (
            <Pressable
              key={t.key}
              onPress={() => setPanel(t.key)}
              style={[styles.tab, active && styles.tabActive]}>
              <Icon name={t.icon} size={16} color={active ? SKY.colors.primary : SKY.colors.onSurfaceVariant} />
              <Text style={[type.pill, { color: active ? SKY.colors.primary : SKY.colors.onSurfaceVariant }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* OPS console status bar */}
      <View style={styles.opsConsole}>
        <View style={styles.opsConsoleLeft}>
          <View style={styles.opsIcon}>
            <Icon name="satellite-alt" size={24} color={SKY.colors.primary} />
          </View>
          <View style={styles.opsText}>
            <View style={styles.opsTitleRow}>
              <Text style={[type.headlineMd, { color: SKY.colors.onSurface }]}>OPS CONSOLE</Text>
              <Pill text="DEFCON 4" bg={SKY.colors.surfaceContainerHighest} color={SKY.colors.tertiary} />
            </View>
            <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]} numberOfLines={1}>
              {syncState}
            </Text>
          </View>
        </View>
        <View style={styles.syncOk}>
          <PingingDot size={10} />
          <Text style={[type.pill, { color: SKY.colors.tertiary }]}>
            {error ? 'SYNC FAIL' : loading && !flights.length ? 'SYNCING' : 'SYNC OK'}
          </Text>
        </View>
      </View>

      {panel === 'alerts' ? (
        <View style={styles.panelBody}>
          <View style={styles.panelHead}>
            <View style={styles.sectionTitleRow}>
              <Icon name="notifications-active" size={20} color={SKY.colors.primary} />
              <Text style={[styles.sectionTitle]}>Trigger Engine</Text>
            </View>
            <Pressable style={styles.createAlert}>
              <Icon name="add-alert" size={16} color={SKY.colors.onPrimaryContainer} />
              <Text style={[type.pill, { color: SKY.colors.onPrimaryContainer, fontWeight: '600' }]}>
                CREATE AIRSPACE ALERT
              </Text>
            </Pressable>
          </View>
          <View style={styles.panelCol}>
            {alerts.map((a) => (
              <AlertCard key={a.title} a={a} />
            ))}
          </View>
        </View>
      ) : null}

      {panel === 'watchlist' ? (
        <View style={styles.panelBody}>
          <View style={styles.panelHead}>
            <View style={styles.sectionTitleRow}>
              <Icon name="radar" size={20} color={SKY.colors.primary} />
              <Text style={[styles.sectionTitle]}>Watched Aircraft Telemetry</Text>
            </View>
            <Pill text={`${watched.length} STREAMING`} bg={SKY.colors.surfaceContainerHigh} color={SKY.colors.onSurfaceVariant} />
          </View>
          {watched.length ? (
            <View style={styles.panelCol}>
              {watched.map((w) => (
                <WatchedCard
                  key={w.id}
                  w={w}
                  onUntrack={() => {
                    untracked.current.add(w.id);
                    setPanel('alerts');
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[type.headlineMd, { color: SKY.colors.onSurfaceVariant, textTransform: 'uppercase' }]}>
                No airborne targets
              </Text>
              <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
                Watchlist derives from the live transponder feed
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {panel === 'settings' ? <SettingsView latencyMs={latencyMs} error={error} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.xxs,
    gap: space.xxs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
  },
  tabActive: {
    backgroundColor: SKY.colors.surfaceContainerHigh,
  },
  opsConsole: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SKY.colors.surfaceContainer,
    borderRadius: radius.xl,
    padding: space.md,
  },
  opsConsoleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexShrink: 1,
  },
  opsIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opsText: {
    flexShrink: 1,
  },
  opsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  syncOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    flexShrink: 0,
  },
  panelBody: {
    gap: space.md,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  sectionTitle: {
    ...type.headlineMd,
    color: SKY.colors.onSurface,
  },
  createAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.primaryContainer,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  panelCol: {
    gap: space.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  alertCard: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.sm,
  },
  alertHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  alertHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 1,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitleBlock: {
    flexShrink: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  alertPill: {
    borderRadius: radius.sm,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    flexShrink: 0,
  },
  cellRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  cell: {
    flex: 1,
    backgroundColor: 'rgba(33,42,57,0.6)',
    borderRadius: radius.lg,
    padding: space.xs,
    gap: 1,
  },
  alertFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  alertAction: {
    backgroundColor: SKY.colors.surfaceContainerHighest,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  watchCard: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.sm,
  },
  watchHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watchId: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  watchIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: SKY.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  untrack: {
    backgroundColor: SKY.colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  watchCells: {
    flexDirection: 'row',
    gap: space.xs,
  },
  watchCell: {
    flex: 1,
    backgroundColor: 'rgba(33,42,57,0.6)',
    borderRadius: radius.lg,
    padding: space.xs,
    gap: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchProgressTrack: {
    height: 4,
    backgroundColor: SKY.colors.surfaceContainerHighest,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  watchProgressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  settingsView: {
    gap: space.md,
  },
  settingsModule: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.sm,
  },
  settingsModuleHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modulePing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
  streamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SKY.colors.tertiary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(33,42,57,0.7)',
    borderRadius: radius.lg,
    padding: space.sm,
    gap: space.sm,
  },
  settingText: {
    flex: 1,
    gap: 1,
  },
  selectBox: {
    flexShrink: 0,
    maxWidth: 200,
    alignSelf: 'flex-start',
  },
  unitBlock: {
    backgroundColor: 'rgba(33,42,57,0.7)',
    borderRadius: radius.lg,
    padding: space.sm,
    gap: space.xs,
  },
  settingsFooter: {
    backgroundColor: SKY.colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  encrypted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
});