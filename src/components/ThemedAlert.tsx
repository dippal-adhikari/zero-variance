import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../theme/ThemeContext';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertConfig = {
  title: string;
  message: string;
  buttons: AlertButton[];
};

type ThemedAlertContextValue = {
  showAlert: (title: string, message: string, buttons: AlertButton[]) => void;
};

const ThemedAlertContext = createContext<ThemedAlertContextValue | null>(null);

export function useThemedAlert() {
  const ctx = useContext(ThemedAlertContext);
  if (!ctx) throw new Error('useThemedAlert must be used within ThemedAlertProvider');
  return ctx;
}

export function ThemedAlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const { palette } = useTheme();
  const c = palette.colors;

  const showAlert = useCallback((title: string, message: string, buttons: AlertButton[]) => {
    setAlert({ title, message, buttons });
  }, []);

  const hide = useCallback(() => setAlert(null), []);

  const handlePress = useCallback(
    (button: AlertButton) => {
      hide();
      button.onPress?.();
    },
    [hide],
  );

  const value = useMemo(() => ({ showAlert }), [showAlert]);

  return (
    <ThemedAlertContext.Provider value={value}>
      {children}
      <Modal
        visible={!!alert}
        transparent
        animationType="fade"
        onRequestClose={hide}
      >
        <Pressable style={styles.overlay} onPress={hide}>
          <Pressable
            style={[styles.dialog, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.title, { color: c.text }]}>{alert?.title}</Text>
            <Text style={[styles.message, { color: c.mutedText }]}>{alert?.message}</Text>
            <View style={styles.buttons}>
              {alert?.buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                const bgColor = isDestructive ? c.danger : isCancel ? c.surface : c.primary;
                const textColor = isDestructive ? c.dangerText : isCancel ? c.text : c.primaryText;
                return (
                  <Pressable
                    key={i}
                    onPress={() => handlePress(btn)}
                    style={[
                      styles.button,
                      { backgroundColor: bgColor, borderColor: c.border },
                    ]}
                  >
                    <Text style={[styles.buttonText, { color: textColor }]}>{btn.text}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedAlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
