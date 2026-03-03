import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation/types';
import { SettingsProvider, useSettings } from './src/state/SettingsContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ThemedAlertProvider } from './src/components/ThemedAlert';
import { HomeScreen } from './src/screens/HomeScreen';
import { TillScreen } from './src/screens/TillScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { navTheme, palette } = useTheme();
  const c = palette.colors;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Till" component={TillScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Root() {
  const { ready } = useSettings();
  const { palette } = useTheme();
  const c = palette.colors;

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, fontWeight: '700', color: c.mutedText }}>Loading…</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <ThemedAlertProvider>
              <Root />
            </ThemedAlertProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
