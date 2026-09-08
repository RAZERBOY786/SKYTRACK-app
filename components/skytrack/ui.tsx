import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { radius, SKY, space, type } from '@/constants/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export function Icon({
  name,
  size = 18,
  color = SKY.colors.primary,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}

/** Small pulsing emerald live beacon with optional trailing label. */
export function LiveDot({
  color = SKY.colors.tertiary,
  size = 6,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: color,
      }}
    />
  );
}

export function PingingDot({
  color = SKY.colors.tertiary,
  size = 8,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: color,
          opacity: 0.5,
          transform: [{ scale: 2.2 }],
        }}
      />
      <LiveDot color={color} size={size} />
    </View>
  );
}

/** Uppercase monospace code pill. */
export function Pill({
  text,
  bg = SKY.colors.surfaceContainerHighest,
  color = SKY.colors.onSurface,
  style,
  bold = false,
}: {
  text: string;
  bg?: string;
  color?: string;
  style?: ViewStyle;
  bold?: boolean;
}) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg },
        style,
      ]}>
      <Text
        style={[
          type.pill,
          { color },
          bold && { fontWeight: '700' },
        ]}>
        {text.toUpperCase()}
      </Text>
    </View>
  );
}

/** Section header row: icon + uppercase title + optional trailing node. */
export function SectionHeader({
  icon,
  title,
  tone = 'primary',
  trailing,
}: {
  icon: IconName;
  title: string;
  tone?: string;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Icon name={icon} size={20} color={tone} />
        <Text style={[type.headlineMd, styles.sectionTitle]}>{title.toUpperCase()}</Text>
      </View>
      {trailing}
    </View>
  );
}

/** Horizontal progress bar with a colored fill. */
export function ProgressBar({
  pct,
  color = SKY.colors.primary,
  bg = SKY.colors.surfaceContainerHighest,
  height = 6,
  radius: rad = radius.full,
}: {
  pct: number;
  color?: string;
  bg?: string;
  height?: number;
  radius?: number;
}) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <View
      style={[
        styles.progressTrack,
        { backgroundColor: bg, height, borderRadius: rad },
      ]}>
      <View
        style={{
          height: '100%',
          width: `${clamped}%`,
          backgroundColor: color,
          borderRadius: rad,
        }}
      />
    </View>
  );
}

/** Dense telemetry mini metric cell (label + value). */
export function MiniMetric({
  label,
  value,
  unit,
  valueColor = SKY.colors.onSurface,
  sub,
  bg = SKY.colors.surfaceContainerLow,
  align = 'flex-start',
}: {
  label: string;
  value: string;
  unit?: string;
  valueColor?: string;
  sub?: string;
  bg?: string;
  align?: 'flex-start' | 'center';
}) {
  return (
    <View style={[styles.miniMetric, { backgroundColor: bg, alignItems: align }]}>
      <Text style={[type.pill, styles.miniLabel]}>{label.toUpperCase()}</Text>
      <View style={styles.miniValueRow}>
        <Text style={[type.metricLabel, { color: valueColor }]}>{value}</Text>
        {unit ? <Text style={[type.pill, styles.miniUnit]}>{unit}</Text> : null}
      </View>
      {sub ? (
        <Text style={[type.telemetry, styles.miniSub, { color: valueColor }]}>{sub}</Text>
      ) : null}
    </View>
  );
}

/** Vertical mini metric for the analytics grid. */
export function MetricCell({
  label,
  value,
  unit,
  valueColor = SKY.colors.onSurface,
  sub,
  subColor = SKY.colors.outline,
  icon,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  valueColor?: string;
  sub?: string;
  subColor?: string;
  icon?: IconName;
  accent?: string;
}) {
  return (
    <View style={styles.metricCell}>
      {icon && accent ? (
        <Icon name={icon} size={54} color={accent} style={styles.metricCellGhost} />
      ) : null}
      <Text style={[type.metricLabel, styles.metricCellLabel]}>{label.toUpperCase()}</Text>
      <View style={styles.miniValueRow}>
        <Text style={[type.metricDisplay, { color: valueColor }]}>{value}</Text>
        {unit ? (
          <Text style={[type.pill, styles.metricCellUnit]}>{unit}</Text>
        ) : null}
      </View>
      {sub ? <Text style={[type.telemetry, { color: subColor }]}>{sub}</Text> : null}
    </View>
  );
}

/** Toggle switch. */
export function Toggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.toggle,
        {
          backgroundColor: value
            ? SKY.colors.primaryContainer
            : SKY.colors.surfaceContainerHighest,
          justifyContent: value ? 'flex-end' : 'flex-start',
        },
      ]}>
      <View style={styles.toggleKnob} />
    </Pressable>
  );
}

/** Setting row: title + description left, control right. */
export function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={[type.bodyMd, { color: SKY.colors.onSurface }]}>{title}</Text>
        <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
          {description}
        </Text>
      </View>
      {control}
    </View>
  );
}

/** Segmented unit selector (active = primary bg). */
export function Segmented<T extends string>({
  options,
  active,
  onSelect,
}: {
  options: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const isActive = opt.key === active;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            style={[
              styles.segmentedItem,
              isActive && { backgroundColor: SKY.colors.primary },
            ]}>
            <Text
              style={[
                type.pill,
                {
                  color: isActive
                    ? SKY.colors.onPrimary
                    : SKY.colors.onSurfaceVariant,
                },
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  sectionTitle: {
    color: SKY.colors.onSurface,
  },
  progressTrack: {
    overflow: 'hidden',
  },
  miniMetric: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.sm,
    padding: space.xs,
  },
  miniLabel: {
    color: SKY.colors.outline,
  },
  miniValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xxs,
  },
  miniUnit: {
    color: SKY.colors.onSurfaceVariant,
    fontWeight: '400',
  },
  miniSub: {
    marginTop: 2,
  },
  metricCell: {
    backgroundColor: SKY.colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space.sm,
    overflow: 'hidden',
  },
  metricCellGhost: {
    position: 'absolute',
    right: -12,
    bottom: -12,
    opacity: 0.3,
  },
  metricCellLabel: {
    color: SKY.colors.onSurfaceVariant,
  },
  metricCellUnit: {
    color: SKY.colors.onSurfaceVariant,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: radius.full,
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: SKY.colors.onPrimary,
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
  segmented: {
    flexDirection: 'row',
    backgroundColor: SKY.colors.surfaceContainerLowest,
    borderRadius: radius.sm,
    padding: space.xxs,
    gap: space.xs,
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: space.xs,
    paddingHorizontal: space.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});