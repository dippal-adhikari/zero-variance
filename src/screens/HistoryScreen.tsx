import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';

import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { useTheme } from '../theme/ThemeContext';
import { deleteEntry, loadHistory } from '../history/history';
import type { TillEntry } from '../history/types';
import { BackIconButton, HeaderBar } from '../components/HeaderBar';
import { darkenHex } from '../theme/colorUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

function HistoryRow({
  item,
  onPress,
  onDelete,
  colors: c,
}: {
  item: TillEntry;
  onPress: () => void;
  onDelete: (close: () => void) => void;
  colors: { surface: string; border: string; text: string; mutedText: string; danger: string; dangerText: string };
}) {
  const swipeRef = useRef<Swipeable | null>(null);
  const renderRightActions = () => (
    <Pressable
      style={[styles.deleteAction, { backgroundColor: c.danger }]}
      onPress={() => onDelete(() => swipeRef.current?.close())}
    >
      <Text style={[styles.deleteActionText, { color: c.dangerText }]}>Delete</Text>
    </Pressable>
  );
  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? darkenHex(c.surface, 0.06) : c.surface,
            borderColor: c.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: c.text }]}>{formatEntryTitle(item.createdAt)}</Text>
        <Text style={[styles.cardSub, { color: c.mutedText }]}>
          Updated {formatEntryTitle(item.updatedAt)}
        </Text>
      </Pressable>
    </Swipeable>
  );
}

function formatEntryTitle(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${weekday} ${date} ${time}`;
}

export function HistoryScreen({ navigation }: Props) {
  const { palette } = useTheme();
  const c = palette.colors;
  const [items, setItems] = useState<TillEntry[]>([]);

  const refresh = useCallback(() => {
    loadHistory()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleDelete = useCallback((entryId: string, onClose: () => void) => {
    deleteEntry(entryId)
      .then(() => {
        setItems((prev) => prev.filter((e) => e.id !== entryId));
        onClose();
      })
      .catch(() => {});
  }, []);

  return (
    <Screen>
      <HeaderBar title="History" left={<BackIconButton onPress={() => navigation.goBack()} />} />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: c.mutedText }]}>No saved till counts yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryRow
            item={item}
            onPress={() => navigation.navigate('Till', { entryId: item.id })}
            onDelete={(close) => handleDelete(item.id, close)}
            colors={c}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 12, paddingBottom: 12, gap: 10 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, fontWeight: '500' },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginLeft: 10,
  },
  deleteActionText: { fontSize: 14, fontWeight: '800' },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '500' },
});

