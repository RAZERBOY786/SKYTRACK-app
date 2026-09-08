import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/skytrack/header';
import { SKY, space } from '@/constants/theme';

/** Full tactical screen: safe area + sticky header + scrollable content. */
export function Screen({
  children,
  subtitle,
  action,
  scroll = true,
}: PropsWithChildren<{
  subtitle: string;
  action?: ReactNode;
  scroll?: boolean;
}>) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Header subtitle={subtitle} action={action} />
        {scroll ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={styles.scroll}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SKY.colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: SKY.colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: space.lg,
    paddingBottom: space['3xl'],
    gap: space.lg,
  },
});