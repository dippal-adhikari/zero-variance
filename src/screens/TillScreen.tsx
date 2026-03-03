import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';
import { Keypad } from '../components/Keypad';
import { AppButton } from '../components/AppButton';
import { BackIconButton, HeaderBar } from '../components/HeaderBar';
import { useThemedAlert } from '../components/ThemedAlert';
import { useSettings } from '../state/SettingsContext';
import { DENOMINATIONS, createEmptyTillRows, type DenominationKey } from '../till/denominations';
import { formatCurrency, parseMoney, sumTotals } from '../till/math';
import { getEntryById, getMostRecentEntry, upsertEntry } from '../history/history';

type Props = NativeStackScreenProps<RootStackParamList, 'Till'>;

type Selection =
  | { kind: 'row'; key: DenominationKey; field: 'rolls' | 'count' }
  | { kind: 'float' };

const KEEP_AWAKE_TAG = 'ZeroVarianceTill';
const ONE_HOUR_MS = 60 * 60 * 1000;

function applyDigit(current: string, digit: string, maxLen: number) {
  const next = (current || '') + digit;
  if (next.length > maxLen) return current;
  if (current === '0') return digit;
  return next;
}

function applyFloatDigit(current: string, digit: string) {
  if (!current) return digit;
  if (!current.includes('.')) return applyDigit(current, digit, 10);
  const [left, right = ''] = current.split('.');
  if (right.length >= 2) return current;
  return `${left}.${right}${digit}`;
}

// Dot input removed from keypad; float entry is digits-only.

export function TillScreen({ navigation, route }: Props) {
  const { palette } = useTheme();
  const c = palette.colors;
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const { showAlert } = useThemedAlert();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;

      activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
      timeout = setTimeout(() => {
        if (cancelled) return;
        deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
      }, ONE_HOUR_MS);

      return () => {
        cancelled = true;
        if (timeout) clearTimeout(timeout);
        deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
      };
    }, []),
  );

  const paramId = route.params?.entryId;
  const [entryId, setEntryId] = useState<string | undefined>(paramId);
  const [rows, setRows] = useState(() => createEmptyTillRows());
  const [float, setFloat] = useState(settings.defaultFloat || '0');
  const [selection, setSelection] = useState<Selection>({ kind: 'row', key: 'c5', field: 'count' });

  const scrollRef = useRef<ScrollView>(null);
  const rowLayoutsRef = useRef<Record<string, number>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setEntryId(paramId);
  }, [paramId]);

  useEffect(() => {
    let mounted = true;
    if (entryId) {
      getEntryById(entryId)
        .then((e) => {
          if (!mounted) return;
          if (!e) return;
          setRows(e.rows);
          setFloat(e.float);
        })
        .catch(() => {});
    } else {
      getMostRecentEntry()
        .then((e) => {
          if (!mounted) return;
          if (e) {
            setEntryId(e.id);
            setRows(e.rows);
            setFloat(e.float);
            navigation.setParams({ entryId: e.id });
          } else {
            setRows(createEmptyTillRows());
            setFloat(settings.defaultFloat || '0');
          }
        })
        .catch(() => {
          if (!mounted) return;
          setRows(createEmptyTillRows());
          setFloat(settings.defaultFloat || '0');
        });
    }
    return () => {
      mounted = false;
    };
  }, [entryId, navigation, settings.defaultFloat]);

  const total = useMemo(() => sumTotals(DENOMINATIONS, rows), [rows]);
  const floatAmount = useMemo(() => parseMoney(float), [float]);
  const earnings = useMemo(() => total - floatAmount, [total, floatAmount]);

  const onDigit = useCallback(
    (digit: string) => {
      if (selection.kind === 'float') {
        setFloat((cur) => applyFloatDigit(cur, digit));
        return;
      }
      setRows((cur) => {
        const row = cur[selection.key];
        const nextVal =
          selection.field === 'rolls'
            ? applyDigit(row.rolls.replace(/\D/g, ''), digit, 6)
            : applyDigit(row.count.replace(/\D/g, ''), digit, 6);
        return {
          ...cur,
          [selection.key]: { ...row, [selection.field]: nextVal },
        };
      });
    },
    [selection],
  );

  const onBack = useCallback(() => {
    if (selection.kind === 'float') {
      setFloat('');
      return;
    }
    setRows((cur) => {
      const row = cur[selection.key];
      return {
        ...cur,
        [selection.key]: { ...row, [selection.field]: '' },
      };
    });
  }, [selection]);

  const onNext = useCallback(() => {
    setSelection((cur) => {
      // Never navigate into Rolls; "Next" cycles Count only.
      if (cur.kind === 'row' && cur.field === 'rolls') {
        return { kind: 'row', key: cur.key, field: 'count' };
      }

      const currentKey = cur.kind === 'row' ? cur.key : DENOMINATIONS[0].key;
      const idx = Math.max(0, DENOMINATIONS.findIndex((d) => d.key === currentKey));
      const nextKey = DENOMINATIONS[(idx + 1) % DENOMINATIONS.length].key;
      return { kind: 'row', key: nextKey, field: 'count' };
    });
  }, []);

  const hasAnyValue = useMemo(() => {
    const floatValue = parseMoney(float);
    if (floatValue !== 0) return true;
    return DENOMINATIONS.some((d) => {
      const r = rows[d.key];
      const rolls = Number(r.rolls || 0);
      const count = Number(r.count || 0);
      return (Number.isFinite(rolls) && rolls > 0) || (Number.isFinite(count) && count > 0);
    });
  }, [float, rows]);

  const autoSave = useCallback(async () => {
    if (!hasAnyValue) return;
    const saved = await upsertEntry({ id: entryId, rows, float: float || '0' });
    setEntryId(saved.id);
    navigation.setParams({ entryId: saved.id });
  }, [entryId, float, hasAnyValue, navigation, rows]);

  const save = useCallback(async () => {
    if (total === 0 && floatAmount === 0) {
      setSaveMessage('Nothing to save');
      setTimeout(() => setSaveMessage(null), 2500);
      showAlert('Nothing to save', 'Add counts or a float value before saving.', [{ text: 'OK' }]);
      return;
    }
    await autoSave();
    showAlert('Saved', 'Till count saved to history.', [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);
  }, [autoSave, navigation, showAlert, total, floatAmount]);

  const reset = useCallback(() => {
    showAlert('Reset?', 'Clear all values for this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setRows(createEmptyTillRows());
          setFloat(settings.defaultFloat || '0');
          setEntryId(undefined);
          navigation.setParams({ entryId: undefined });
          setSelection({ kind: 'row', key: 'c5', field: 'count' });
        },
      },
    ]);
  }, [navigation, settings.defaultFloat, showAlert]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!hasAnyValue) return;

      e.preventDefault();
      void autoSave().then(() => navigation.dispatch(e.data.action));
    });

    return unsub;
  }, [autoSave, hasAnyValue, navigation]);

  useEffect(() => {
    if (selection.kind === 'row' && selection.field === 'count') {
      const y = rowLayoutsRef.current[selection.key];
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 160), animated: true });
      }
    }
  }, [selection]);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <HeaderBar
        title=""
        left={<BackIconButton onPress={() => navigation.goBack()} />}
        right={
          <View style={styles.headerButtons}>
            <AppButton
              title="Reset"
              variant="ghost"
              onPress={reset}
              style={styles.smallBtn}
              textStyle={styles.smallBtnText}
            />
            <AppButton
              title="Save"
              variant="accent"
              onPress={save}
              style={styles.smallBtn}
              textStyle={styles.smallBtnText}
            />
          </View>
        }
      />

      {saveMessage ? (
        <View style={[styles.saveMessage, { backgroundColor: c.mutedText }]}>
          <Text style={[styles.saveMessageText, { color: c.background }]}>{saveMessage}</Text>
        </View>
      ) : null}
      <View style={styles.body}>
        <View style={[styles.top, { borderColor: c.border, backgroundColor: c.surface }]}>
          <View style={[styles.tableHeader, { borderColor: c.border, backgroundColor: c.background }]}>
            <Text style={[styles.th, styles.colDollar, { color: c.mutedText }]}>$</Text>
            <Text style={[styles.th, styles.colRolls, { color: c.mutedText }]}>Rolls</Text>
            <View style={styles.colCountWrap}>
              <Text style={[styles.th, styles.colCount, { color: c.mutedText }]}>Count</Text>
            </View>
            <Text style={[styles.th, styles.colTotal, { color: c.mutedText, borderLeftColor: c.border }]}>Total</Text>
          </View>

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.tableBody}
            keyboardShouldPersistTaps="handled"
          >
            {DENOMINATIONS.map((d) => {
              const r = rows[d.key];
              const selectedRolls =
                selection.kind === 'row' && selection.key === d.key && selection.field === 'rolls';
              const selectedCount =
                selection.kind === 'row' && selection.key === d.key && selection.field === 'count';
              const rollsEnabled = d.type === 'coin';
              const rollsLabel = rollsEnabled ? r.rolls || '' : '—';
              const countLabel = r.count || '';

              const rowTotal = formatCurrency(
                (d.type === 'coin'
                  ? (Number(r.rolls || 0) * (d.coinsPerRoll ?? 0) + Number(r.count || 0)) * d.value
                  : Number(r.count || 0) * d.value) || 0,
              );

              return (
                <View
                  key={d.key}
                  style={[styles.tr, { borderColor: c.border }]}
                  onLayout={(e) => {
                    rowLayoutsRef.current[d.key] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={[styles.td, styles.colDollar, { color: c.text }]}>{d.label}</Text>

                  <Pressable
                    accessibilityRole="button"
                    disabled={!rollsEnabled}
                    onPress={() => rollsEnabled && setSelection({ kind: 'row', key: d.key, field: 'rolls' })}
                    style={[
                      styles.tdBox,
                      styles.colRolls,
                      {
                        borderColor: selectedRolls ? c.accent : c.border,
                        backgroundColor: selectedRolls ? c.background : c.surface,
                        opacity: rollsEnabled ? 1 : 0.5,
                      },
                    ]}
                  >
                    <Text style={[styles.tdValue, { color: c.text }]}>{rollsLabel}</Text>
                  </Pressable>

                  <View style={styles.colCountWrap}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setSelection({ kind: 'row', key: d.key, field: 'count' })}
                      style={[
                        styles.tdBox,
                        styles.colCount,
                        {
                          borderColor: selectedCount ? c.accent : c.border,
                          backgroundColor: selectedCount ? c.background : c.surface,
                        },
                      ]}
                    >
                      <Text style={[styles.tdValue, { color: c.text }]}>{countLabel}</Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.td, styles.colTotal, { color: c.text, borderLeftColor: c.border }]}>{rowTotal}</Text>
                </View>
              );
            })}

            <View style={[styles.summaryRow, { borderColor: c.border }]}>
              <Text style={[styles.summaryLabel, { color: c.text }]}>Total</Text>
              <Text style={[styles.summaryValue, { color: c.text }]}>{formatCurrency(total)}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setSelection({ kind: 'float' })}
              style={[
                styles.summaryRow,
                {
                  borderColor: selection.kind === 'float' ? c.accent : c.border,
                  backgroundColor: selection.kind === 'float' ? c.background : c.surface,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: c.text }]}>Float</Text>
              <Text style={[styles.summaryValue, { color: c.text }]}>{formatCurrency(floatAmount)}</Text>
            </Pressable>

            <View style={[styles.summaryRow, { borderColor: c.border }]}>
              <Text style={[styles.summaryLabel, { color: c.text }]}>Earnings (Total − Float)</Text>
              <Text style={[styles.summaryValue, { color: c.text }]}>{formatCurrency(earnings)}</Text>
            </View>
          </ScrollView>
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom }]}>
          <Keypad
            onDigit={onDigit}
            onBack={onBack}
            onNext={onNext}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  saveMessage: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMessageText: { fontSize: 14, fontWeight: '600' },
  headerButtons: { flexDirection: 'row', gap: 10},
  smallBtn: { paddingVertical: 10, paddingHorizontal: 12},
  smallBtnText: { fontSize: 14, fontWeight: '600' },
  body: { flex: 1, paddingTop: 10 },
  top: { flex: 1, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  bottom: { paddingTop: 8 },

  tableHeader: { flexDirection: 'row', borderBottomWidth: 1 },
  th: { paddingVertical: 10, paddingHorizontal: 10, fontSize: 14, fontWeight: '700' },
  tableBody: { paddingBottom: 12 },

  tr: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  td: { paddingVertical: 10, paddingHorizontal: 10, fontSize: 14, fontWeight: '600' },
  tdBox: { paddingVertical: 6, paddingHorizontal: 8, borderWidth: 2, borderRadius: 12, marginVertical: 8 },
  tdValue: { fontSize: 13, fontWeight: '500', textAlign: 'center' },

  colDollar: { flex: 0.5, paddingLeft: 16 },
  colRolls: { flex: 0.4, marginRight: 6 },
  colCountWrap: { flex: 1, marginLeft: 6, marginRight: 6, paddingHorizontal: 12, justifyContent: 'center' },
  colCount: { width: 72 },
  colTotal: { flex: 0, minWidth: 80, textAlign: 'right', borderLeftWidth: 1, paddingLeft: 6 },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  summaryLabel: { fontSize: 14, fontWeight: '700' },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
});

