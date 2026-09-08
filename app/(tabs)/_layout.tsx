import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SKY, type } from '@/constants/theme';

type RouteName = 'index' | 'flights' | 'stats' | 'alerts';

const NAV: { name: RouteName; label: string; icon: ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { name: 'index', label: 'MAP', icon: 'radar' },
  { name: 'flights', label: 'FLIGHTS', icon: 'flight-takeoff' },
  { name: 'stats', label: 'STATS', icon: 'analytics' },
  { name: 'alerts', label: 'ALERTS', icon: 'notifications-active' },
];

function SkytrackTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const item = NAV.find((n) => n.name === route.name) ?? NAV[0];
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={[styles.item, focused && styles.itemActive]}>
            <MaterialIcons
              name={item.icon}
              size={22}
              color={focused ? SKY.colors.primary : SKY.colors.onSurfaceVariant}
            />
            <Text style={[type.pill, { color: focused ? SKY.colors.primary : SKY.colors.onSurfaceVariant }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: SKY.colors.primary,
        tabBarInactiveTintColor: SKY.colors.onSurfaceVariant,
      }}
      tabBar={(props) => <SkytrackTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'MAP' }} />
      <Tabs.Screen name="flights" options={{ title: 'FLIGHTS' }} />
      <Tabs.Screen name="stats" options={{ title: 'STATS' }} />
      <Tabs.Screen name="alerts" options={{ title: 'ALERTS' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5,14,28,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  item: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 8,
    paddingVertical: 4,
  },
  itemActive: {
    backgroundColor: 'rgba(22,32,47,0.6)',
  },
});