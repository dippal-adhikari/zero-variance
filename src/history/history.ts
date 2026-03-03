import { getJson, removeKey, setJson } from '../storage/storage';
import type { TillEntry } from './types';

const HISTORY_KEY = 'zero-variance.history.v1';

function createId(): string {
  const rand = Math.random().toString(16).slice(2);
  return `till_${Date.now()}_${rand}`;
}

export async function loadHistory(): Promise<TillEntry[]> {
  const stored = await getJson<TillEntry[]>(HISTORY_KEY);
  if (!stored) return [];
  if (!Array.isArray(stored)) return [];
  return stored;
}

export async function getEntryById(entryId: string): Promise<TillEntry | null> {
  const list = await loadHistory();
  return list.find((e) => e.id === entryId) ?? null;
}

export async function getMostRecentEntry(): Promise<TillEntry | null> {
  const list = await loadHistory();
  return list[0] ?? null;
}

export async function upsertEntry(input: Omit<TillEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<TillEntry> {
  const list = await loadHistory();
  const now = new Date().toISOString();

  if (input.id) {
    const idx = list.findIndex((e) => e.id === input.id);
    if (idx >= 0) {
      const updated: TillEntry = {
        ...list[idx],
        rows: input.rows,
        float: input.float,
        updatedAt: now,
      };
      const next = [...list];
      next[idx] = updated;
      await setJson(HISTORY_KEY, next);
      return updated;
    }
  }

  const created: TillEntry = {
    id: input.id ?? createId(),
    createdAt: now,
    updatedAt: now,
    rows: input.rows,
    float: input.float,
  };
  await setJson(HISTORY_KEY, [created, ...list]);
  return created;
}

export async function deleteAllHistory(): Promise<void> {
  await removeKey(HISTORY_KEY);
}

export async function deleteEntry(entryId: string): Promise<void> {
  const list = await loadHistory();
  const filtered = list.filter((e) => e.id !== entryId);
  if (filtered.length === 0) {
    await removeKey(HISTORY_KEY);
    return;
  }
  await setJson(HISTORY_KEY, filtered);
}

