import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { palette } = useTheme();
  const c = palette.colors;

  const subtitle = useMemo(() => {
    const lines = [
      'Count with confidence',
      'Precision in every count',
      'Every count. Zero variance.',
      'Where precision meets accountability',
      'Count smarter. Close faster.',
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: c.primary }]}>
          <Text style={[styles.logoText, { color: c.primaryText }]}>O</Text>
        </View>
        <Text style={[styles.title, { color: c.text }]}>Zero Variance</Text>
        <Text style={[styles.subtitle, { color: c.mutedText }]}>{subtitle}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton title="Start" onPress={() => navigation.navigate('Till')} />
        <AppButton title="Settings" variant="ghost" onPress={() => navigation.navigate('Settings')} />
        <AppButton title="History" variant="ghost" onPress={() => navigation.navigate('History')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10},
  logo: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 46, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, fontWeight: '500' },
  actions: { gap: 12, marginBottom: 40 },
});

