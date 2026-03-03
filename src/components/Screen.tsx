import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeContext';

export function Screen({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  const padTop = edges.includes('top') ? Math.max(insets.top, 16) : 16;
  const padBottom = edges.includes('bottom') ? insets.bottom : 0;
  const padH = Math.max(insets.left, insets.right, 16);

  return (
    <View style={[styles.safe, { backgroundColor: palette.colors.background }]}>
      <View style={[styles.inner, { paddingTop: padTop, paddingBottom: padBottom, paddingHorizontal: padH }]}>
        <View style={[{ flex: 1 }, style]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});

