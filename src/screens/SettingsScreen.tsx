import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';
import { THEME_PALETTES, type ThemePaletteId } from '../theme/palettes';
import { useSettings } from '../state/SettingsContext';
import { deleteAllHistory } from '../history/history';
import { BackIconButton, HeaderBar } from '../components/HeaderBar';
import { AppButton } from '../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function sanitizeMoneyInput(input: string) {
  const cleaned = input.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  const left = cleaned.slice(0, firstDot) || '0';
  const rightRaw = cleaned.slice(firstDot + 1).replace(/\./g, '');
  const right = rightRaw.slice(0, 2);
  return `${left}.${right}`;
}

export function SettingsScreen({ navigation }: Props) {
  const { palette } = useTheme();
  const c = palette.colors;
  const insets = useSafeAreaInsets();
  const { settings, setDefaultFloat, setThemeId } = useSettings();

  const [floatDraft, setFloatDraft] = useState(settings.defaultFloat || '0');
  const floatDraftRef = useRef(floatDraft);
  floatDraftRef.current = floatDraft;

  const palettes = useMemo(() => Object.values(THEME_PALETTES), []);

  useEffect(() => {
    setFloatDraft(settings.defaultFloat || '0');
  }, [settings.defaultFloat]);

  const persistIfDirty = useMemo(() => {
    return () => {
      const next = floatDraftRef.current || '0';
      const current = settings.defaultFloat || '0';
      if (next !== current) setDefaultFloat(next);
    };
  }, [setDefaultFloat, settings.defaultFloat]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      persistIfDirty();
    });
    return unsub;
  }, [navigation, persistIfDirty]);

  return (
    <Screen>
      <View style={styles.container}>
        <HeaderBar
          title="Settings"
          left={
            <BackIconButton
              onPress={() => {
                persistIfDirty();
                navigation.goBack();
              }}
            />
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.h2, { color: c.text }]}>Theme</Text>
          <View style={styles.palettes}>
            {palettes.map((p) => {
              const selected = p.id === settings.themeId;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  onPress={() => setThemeId(p.id as ThemePaletteId)}
                  style={[
                    styles.paletteCard,
                    {
                      backgroundColor: p.colors.surface,
                      borderColor: selected ? c.accent : c.border,
                    },
                  ]}
                >
                  <View style={styles.swatches}>
                    <View style={[styles.swatch, { backgroundColor: p.colors.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: p.colors.accent }]} />
                  </View>
                  <Text style={[styles.paletteName, { color: p.colors.text }]}>{p.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.h2, { color: c.text }]}>Float</Text>
          <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.surface }]}>
            <Text style={[styles.prefix, { color: c.mutedText }]}>$</Text>
            <TextInput
              value={floatDraft}
              onChangeText={(t) => setFloatDraft(sanitizeMoneyInput(t))}
              placeholder="0.00"
              placeholderTextColor={c.mutedText}
              keyboardType="decimal-pad"
              style={[styles.input, { color: c.text }]}
            />
          </View>

          <Text style={[styles.h2, { color: c.text }]}>History</Text>
          <AppButton
            title="Delete all history"
            variant="danger"
            onPress={() => {
              Alert.alert('Delete history?', 'This cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteAllHistory();
                    Alert.alert('Deleted', 'History has been cleared.');
                  },
                },
              ]);
            }}
          />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: c.background, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text style={[styles.credit, { color: c.mutedText }]}>
            Developed by{' '}
            <Text
              accessibilityRole="link"
              onPress={() => {
                void Linking.openURL('https://www.instagram.com/dippal_adhikari/');
              }}
              style={[styles.creditName, { color: c.mutedText }]}
            >
              Dippal Adhikari
            </Text>
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 70, gap: 12 },
  h2: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  palettes: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  paletteCard: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  swatches: { flexDirection: 'row', gap: 8 },
  swatch: { width: 18, height: 18, borderRadius: 6 },
  paletteName: { fontSize: 14, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  prefix: { fontSize: 16, fontWeight: '500' },
  input: { flex: 1, fontSize: 16, fontWeight: '500', paddingHorizontal: 8 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credit: { fontSize: 12, fontWeight: '400' },
  creditName: { fontSize: 12, fontWeight: '700', textDecorationLine: 'none' },
});

