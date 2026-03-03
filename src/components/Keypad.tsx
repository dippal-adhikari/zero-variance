import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { darkenHex } from '../theme/colorUtils';

type Key = { label: string; value: string; kind: 'digit' | 'back' | 'next' };

const KEYS: Key[] = [
  { label: '1', value: '1', kind: 'digit' },
  { label: '2', value: '2', kind: 'digit' },
  { label: '3', value: '3', kind: 'digit' },
  { label: '4', value: '4', kind: 'digit' },
  { label: '5', value: '5', kind: 'digit' },
  { label: '6', value: '6', kind: 'digit' },
  { label: '7', value: '7', kind: 'digit' },
  { label: '8', value: '8', kind: 'digit' },
  { label: '9', value: '9', kind: 'digit' },
  { label: '⌫', value: 'back', kind: 'back' },
  { label: '0', value: '0', kind: 'digit' },
  { label: '›', value: 'next', kind: 'next' },
];

export function Keypad({
  onDigit,
  onBack,
  onNext,
}: {
  onDigit: (digit: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { palette } = useTheme();
  const c = palette.colors;

  return (
    <View style={[styles.wrap, { borderColor: c.border, backgroundColor: c.surface }]}>
      {KEYS.map((k) => {
        const disabled = false;
        return (
          <Pressable
            key={`${k.kind}_${k.label}`}
            accessibilityRole="button"
            accessibilityLabel={k.kind === 'back' ? 'Backspace' : k.kind === 'next' ? 'Next' : undefined}
            disabled={disabled}
            onPress={() => {
              if (k.kind === 'digit') onDigit(k.value);
              else if (k.kind === 'next') onNext();
              else onBack();
            }}
            style={({ pressed }) => [
              styles.key,
              {
                borderColor: c.border,
                backgroundColor: pressed ? darkenHex(c.surface, 0.12) : c.surface,
                opacity: disabled ? 0.35 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.keyText,
                k.kind === 'next' && styles.nextText,
                { color: c.text },
              ]}
            >
              {k.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  key: {
    width: '33.3333%',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
  },
  nextText: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: -2,
  },
});

