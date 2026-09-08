import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { SKY } from '@/constants/theme';

/** Translucent telemetry sparkline with area gradient fill. */
export function Sparkline({
  points,
  width = 112,
  height = 24,
  color = SKY.colors.secondary,
}: {
  points: { x: number; y: number }[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (points.length < 2) return null;
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;
  const id = `grad-${color.replace('#', '')}`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={line} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d={area} fill={`url(#${id})`} />
    </Svg>
  );
}

const COUNTRY_DENSITY = Array.from({ length: 11 }, (_, i) => ({
  x: i * 10,
  y: [18, 14, 19, 8, 11, 4, 16, 9, 13, 6, 10][i],
}));

export function DensitySparkline() {
  return <Sparkline points={COUNTRY_DENSITY} width={112} height={24} />;
}

/** Donut / ring chart for the airborne vs ground split. */
export function DonutChart({
  pct,
  size = 112,
  strokeWidth = 10,
  color = SKY.colors.secondary,
  trackColor = SKY.colors.surfaceContainer,
  remainder = SKY.colors.outline,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  remainder?: string;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle
        cx={c}
        cy={c}
        r={r}
        fill="transparent"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={c}
        cy={c}
        r={r}
        fill="transparent"
        stroke={remainder}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ - dash} ${circ}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${c} ${c})`}
      />
      <Circle
        cx={c}
        cy={c}
        r={r}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={-(circ - dash) / 2}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
      />
    </Svg>
  );
}

/** Hourly airborne concurrency curve with peak markers. */
export function TrafficCurve({
  width = 300,
  height = 64,
  color = SKY.colors.secondary,
  peak = { x: 180, y: 10 },
}: {
  width?: number;
  height?: number;
  color?: string;
  peak?: { x: number; y: number };
}) {
  const line =
    'M 0,45 Q 30,50 60,42 T 120,35 T 180,10 T 240,16 T 300,38';
  const area = `${line} L 300,60 L 0,60 Z`;
  const id = `traffic-${color.replace('#', '')}`;
  return (
    <Svg width="100%" height={height} viewBox="0 0 300 60" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${id})`} />
      <Path
        d={line}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={peak.x} cy={peak.y} r={3.5} fill={SKY.colors.tertiary} />
    </Svg>
  );
}

/** Gyroscopic heading compass with rotating needle. */
export function CompassGauge({
  heading,
  size = 96,
}: {
  heading: number;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="42" fill="none" stroke={SKY.colors.surfaceVariant} strokeWidth="2" />
      <Circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke={SKY.colors.surfaceContainer}
        strokeWidth="1.5"
        strokeDasharray="2 3"
      />
      <SvgText x="50" y="14" fill={SKY.colors.outline} fontSize="8" textAnchor="middle" fontFamily={SKY.fonts.MonoBold}>
        N
      </SvgText>
      <SvgText x="88" y="53" fill={SKY.colors.outline} fontSize="8" textAnchor="middle" fontFamily={SKY.fonts.MonoBold}>
        E
      </SvgText>
      <SvgText x="50" y="92" fill={SKY.colors.outline} fontSize="8" textAnchor="middle" fontFamily={SKY.fonts.MonoBold}>
        S
      </SvgText>
      <SvgText x="12" y="53" fill={SKY.colors.outline} fontSize="8" textAnchor="middle" fontFamily={SKY.fonts.MonoBold}>
        W
      </SvgText>
      <Line
        x1="50"
        y1="50"
        x2="50"
        y2="18"
        stroke={SKY.colors.tertiary}
        strokeWidth="2.5"
        strokeLinecap="round"
        transform={`rotate(${heading} 50 50)`}
      />
      <Polygon
        points={`50,14 ${50 - 4},22 ${50 + 4},22`}
        fill={SKY.colors.tertiary}
        transform={`rotate(${heading} 50 50)`}
      />
      <Circle cx="50" cy="50" r="4" fill={SKY.colors.onPrimary} stroke={SKY.colors.tertiary} strokeWidth="1.5" />
    </Svg>
  );
}