import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';

import { Icon } from '@/components/skytrack/ui';
import { radius, SKY, space, type } from '@/constants/theme';
import { dms, LiveFlight } from '@/lib/aviation';

const MARKER_CAP = 180;
const DEFAULT_DELTA = { latitudeDelta: 8, longitudeDelta: 8 };

export type RadarFlight = {
  callsign: string;
  airline: string;
  lat: number;
  lng: number;
  heading: number;
  alt: string;
  altFt: number;
  spd: string;
  speedKt: number;
  vs: string;
  vsFpm: number;
  sqk: string;
  fullType: string;
  origin: string;
  dest: string;
  eta: string;
  icao: string;
  ground?: boolean;
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a6a7a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#4a6a7a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5a7a8a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1422' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#2a4a5a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#4a6a7a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.stroke', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.stroke', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
];

export function flightsToRadar(flights: LiveFlight[]): RadarFlight[] {
  if (!flights.length) return [];
  return flights.slice(0, MARKER_CAP).map((f) => {
    const altFt = Math.max(0, Math.round(f.altFt));
    const ground = f.status === 'ground';
    return {
      callsign: f.callsign || '----',
      airline: f.airlineIcao || '----',
      lat: f.lat,
      lng: f.lng,
      heading: Math.round(f.heading % 360),
      alt: `FL${Math.floor(altFt / 100)}`,
      altFt,
      spd: `${Math.round(f.speedKt)} kt`,
      speedKt: Math.round(f.speedKt),
      vs: `${f.vsFpm > 0 ? '+' : ''}${Math.round(f.vsFpm)} fpm`,
      vsFpm: Math.round(f.vsFpm),
      sqk: f.squawk ? String(f.squawk).padStart(4, '0') : '----',
      fullType: f.aircraftIcao ? f.aircraftIcao.toUpperCase() : f.reg !== '----' ? f.reg : 'ADS-B SQR',
      origin: f.dep,
      dest: f.arr,
      eta: '--:-- UTC',
      icao: f.hex || '----',
      ground,
    };
  });
}

function computeInitialRegion(flights: RadarFlight[]): Region {
  if (!flights.length) {
    return { latitude: 39.8283, longitude: -98.5795, ...DEFAULT_DELTA };
  }
  const lngs = flights.map((f) => f.lng);
  const lats = flights.map((f) => f.lat);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  if (maxLng - minLng < 1) {
    const c = (minLng + maxLng) / 2;
    minLng = c - 0.5;
    maxLng = c + 0.5;
  }
  if (maxLat - minLat < 1) {
    const c = (minLat + maxLat) / 2;
    minLat = c - 0.5;
    maxLat = c + 0.5;
  }
  const pad = 0.15;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * (1 + pad * 2),
    longitudeDelta: (maxLng - minLng) * (1 + pad * 2),
  };
}

export function RadarMap({
  flights,
  selected,
  onSelect,
}: {
  flights: RadarFlight[];
  selected: string;
  onSelect: (flight: RadarFlight) => void;
}) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const focus = useMemo(
    () => flights.find((f) => f.callsign === selected) ?? flights[0] ?? null,
    [flights, selected],
  );

  const initialRegion = useMemo(() => computeInitialRegion(flights), [flights]);

  const flyToFocus = useCallback(() => {
    if (!focus || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: focus.lat, longitude: focus.lng, latitudeDelta: 4, longitudeDelta: 4 },
      500,
    );
  }, [focus]);

  const zoomIn = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((cam) => {
      if (!cam.zoom) return;
      mapRef.current?.animateCamera({ zoom: cam.zoom + 1 }, { duration: 200 });
    });
  }, []);

  const zoomOut = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((cam) => {
      if (!cam.zoom) return;
      mapRef.current?.animateCamera({ zoom: Math.max(1, cam.zoom - 1) }, { duration: 200 });
    });
  }, []);

  const onRegionChange = useCallback((r: Region) => {
    setRegion(r);
  }, []);

  const markers = useMemo(
    () =>
      flights.map((f) => {
        const isSel = f.callsign === focus?.callsign;
        const markerColor = isSel ? SKY.colors.tertiary : f.ground ? SKY.colors.outline : SKY.colors.primary;
        return (
          <Marker
            key={f.callsign}
            coordinate={{ latitude: f.lat, longitude: f.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => onSelect(f)}>
            <View style={styles.markerWrap}>
              {isSel && <View style={[styles.selRing, { borderColor: markerColor }]} />}
              <View
                style={[
                  styles.markerIcon,
                  { transform: [{ rotate: `${f.heading}deg` }] },
                ]}>
                <MaterialIcons
                  name={f.ground ? 'airplanemode-inactive' : 'airplanemode-active'}
                  size={isSel ? 22 : 18}
                  color={markerColor}
                />
              </View>
              {isSel && <View style={[styles.selDot, { backgroundColor: markerColor }]} />}
            </View>
          </Marker>
        );
      }),
    [flights, focus, onSelect],
  );

  const currentLat = region?.latitude ?? focus?.lat ?? 0;
  const currentLng = region?.longitude ?? focus?.lng ?? 0;
  const currentCoords = dms(currentLat, currentLng);

  const hasSurface = flights.some((f) => f.ground);

  return (
    <View style={styles.stage}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        customMapStyle={DARK_MAP_STYLE}
        onRegionChangeComplete={onRegionChange}
        loadingEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        mapPadding={{ top: 48, right: 16, bottom: 16, left: 16 }}>
        {markers}
      </MapView>

      {/* HUD coordinates overlay */}
      <View style={styles.hudTopLeft} pointerEvents="none">
        <View style={styles.hudChip}>
          <Text style={[type.telemetry, hudChipText]}>{`LAT ${currentCoords.lat}`}</Text>
        </View>
        <View style={styles.hudChip}>
          <Text style={[type.telemetry, hudChipText]}>{`LON ${currentCoords.lon}`}</Text>
        </View>
        {focus && (
          <View style={styles.hudChip}>
            <Text style={[type.pill, { color: SKY.colors.primary }]}>SECTOR-09B</Text>
          </View>
        )}
      </View>

      {/* Map controls */}
      <View style={styles.controls}>
        <Pressable style={styles.controlBtn} onPress={zoomIn}>
          <Icon name="add" size={18} color={SKY.colors.primary} />
        </Pressable>
        <Pressable style={styles.controlBtn} onPress={zoomOut}>
          <Icon name="remove" size={18} color={SKY.colors.primary} />
        </Pressable>
        <Pressable style={[styles.controlBtn, styles.controlBtnHighlight]} onPress={flyToFocus}>
          <Icon name="my-location" size={18} color={SKY.colors.onPrimaryContainer} />
        </Pressable>
      </View>

      {/* Selected flight info callout */}
      {focus && (
        <View style={styles.selCard} pointerEvents="none">
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: SKY.colors.tertiary }} />
          <Text style={[type.pill, { color: SKY.colors.tertiary, fontWeight: '700' }]}>{focus.callsign}</Text>
          <Text style={[type.telemetry, { color: SKY.colors.onSurface }]}>{focus.alt}</Text>
          <Text style={[type.pill, { color: SKY.colors.secondary }]}>{focus.spd.replace(' kt', 'KT')}</Text>
        </View>
      )}

      {/* No-feed standby overlay */}
      {flights.length === 0 ? (
        <View style={styles.noFeed} pointerEvents="none">
          <View style={styles.noFeedDot} />
          <Text style={[type.headlineMd, { color: SKY.colors.onSurface, textTransform: 'uppercase' }]}>
            NO FEED — STANDBY
          </Text>
          <Text style={[type.telemetry, { color: SKY.colors.onSurfaceVariant }]}>
            Waiting for transponder data
          </Text>
        </View>
      ) : null}

      {/* Surface blip */}
      {hasSurface ? (
        <View style={styles.botLabel} pointerEvents="none">
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: SKY.colors.outline }} />
          <Text style={[type.pill, { color: SKY.colors.outline }]}>SURFACE</Text>
        </View>
      ) : null}

      {/* Map legend */}
      <View style={styles.legend} pointerEvents="none">
        <LegendItem color={SKY.colors.primary} label="Airborne" />
        <LegendItem color={SKY.colors.tertiary} label="Locked Target" />
        <LegendItem color={SKY.colors.outline} label="Ramp" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[type.pill, { color: SKY.colors.onSurfaceVariant }]}>{label}</Text>
    </View>
  );
}

const hudChipText = { color: SKY.colors.onSurfaceVariant } as const;

const styles = StyleSheet.create({
  stage: {
    height: 400,
    backgroundColor: SKY.colors.surfaceContainerLowest,
    overflow: 'hidden',
    borderRadius: radius.xl,
  },
  hudTopLeft: {
    position: 'absolute',
    top: 8,
    left: 16,
    flexDirection: 'row',
    gap: space.xs,
  },
  hudChip: {
    backgroundColor: 'rgba(5,14,28,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(142,213,255,0.15)',
  },
  controls: {
    position: 'absolute',
    top: 8,
    right: 16,
    gap: space.xs,
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(5,14,28,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(142,213,255,0.15)',
  },
  controlBtnHighlight: {
    backgroundColor: 'rgba(56,189,248,0.25)',
    borderColor: SKY.colors.primaryContainer,
  },
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  selRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  markerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selCard: {
    position: 'absolute',
    top: 48,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: 'rgba(5,14,28,0.9)',
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(82,232,124,0.3)',
  },
  noFeed: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: 'rgba(5,14,28,0.9)',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(142,213,255,0.1)',
  },
  noFeedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SKY.colors.tertiary,
  },
  botLabel: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: 'rgba(5,14,28,0.8)',
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: 'rgba(5,14,28,0.85)',
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: 'rgba(142,213,255,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
