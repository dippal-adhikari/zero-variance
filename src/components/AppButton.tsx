import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { darkenHex } from '../theme/colorUtils';

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}) {
  const { palette } = useTheme();
  const colors = palette.colors;

  const baseBg =
    variant === 'primary'
      ? colors.primary
      : variant === 'accent'
        ? colors.accent
        : variant === 'danger'
          ? colors.danger
          : colors.surface;

  const fg =
    variant === 'primary'
      ? colors.primaryText
      : variant === 'accent'
        ? colors.accentText
        : variant === 'danger'
          ? colors.dangerText
          : colors.text;

  const borderColor = variant === 'ghost' ? colors.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            variant === 'ghost' && pressed ? darkenHex(colors.surface, 0.06) : baseBg,
          borderColor,
          opacity: disabled ? 0.5 : variant === 'ghost' ? 1 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: fg }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

