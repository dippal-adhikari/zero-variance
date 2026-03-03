import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export function BackIconButton({ onPress }: { onPress: () => void }) {
  const { palette } = useTheme();
  const c = palette.colors;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backBtn,
        { backgroundColor: pressed ? c.background : 'transparent' },
      ]}
    >
      <Text style={[styles.backIcon, { color: c.text }]}>{'‹'}</Text>
    </Pressable>
  );
}

export function HeaderBar({
  title,
  left,
  right,
}: {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const { palette } = useTheme();
  const c = palette.colors;

  return (
    <View style={styles.wrap}>
      <View style={styles.sideLeft}>{left}</View>
      <View pointerEvents="none" style={styles.center}>
        <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.sideRight}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 48, justifyContent: 'center' },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700' },
  sideLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center' },
  sideRight: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center' },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 999 },
  backIcon: { fontSize: 34, fontWeight: '700', marginTop: -6 },
});

