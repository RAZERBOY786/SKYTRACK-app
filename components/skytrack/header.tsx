import { memo, useEffect, useState } from 'react';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { SKY, type } from '@/constants/theme';

/** Isolated ticking clock: only this text re-renders each second. */
const ClockText = memo(function ClockText() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant, marginLeft: 4 }]}>
      {`${now.toISOString().slice(11, 19)} UTC`}
    </Text>
  );
});

/** SkyTrack aviation logo recreated as an inline SVG component. */
export function SkytrackLogo({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 40 22">
      <Circle cx="16" cy="12" r="9" stroke={SKY.colors.surfaceContainerHigh} strokeWidth="1" strokeDasharray="3 3" fill="none" />
      <Circle cx="16" cy="12" r="5" stroke={SKY.colors.secondaryContainer} strokeWidth="0.7" opacity={0.4} fill="none" />
      <Path
        d="M11 16L15 12L20 10.5"
        stroke={SKY.colors.primary}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="2 2"
        fill="none"
      />
      <Polygon points="16,4 20,14 16,12.5 12,14" fill={SKY.colors.primary} />
      <Polygon points="16,9 17.5,12.5 16,11.9 14.5,12.5" fill={SKY.colors.secondary} />
      <Circle cx="16" cy="4" r="1.6" fill={SKY.colors.tertiary} />
    </Svg>
  );
}

/** Fixed tactical header used across all SKYTRACK screens. */
export function Header({
  subtitle,
  action,
  showClock = true,
  liveLabel = 'LIVE',
}: {
  subtitle: string;
  action?: React.ReactNode;
  showClock?: boolean;
  liveLabel?: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.brand}>
          <SkytrackLogo />
          <View style={styles.brandText}>
            <View style={styles.brandTitleRow}>
              <Text style={[type.headlineMd, styles.brandTitle]}>SKYTRACK</Text>
              <View style={styles.opsPill}>
                <Text style={[type.pill, { color: SKY.colors.secondary }]}>TAC-OPS</Text>
              </View>
            </View>
            <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.liveBadge}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 7,
                backgroundColor: SKY.colors.tertiary,
                marginRight: 4,
              }}
            />
            <Text style={[type.pill, { color: SKY.colors.tertiary }]}>{liveLabel}</Text>
            {showClock ? <ClockText /> : null}
          </View>
          {action ? action : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(5,14,28,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  brandText: {
    flexShrink: 1,
    gap: 2,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    color: SKY.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: -0.4,
  },
  opsPill: {
    backgroundColor: SKY.colors.surfaceContainerHighest,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33,42,57,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});