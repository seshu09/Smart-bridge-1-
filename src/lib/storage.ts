import { SavedItem } from '../types';

const STORAGE_KEY = 'edugenie_saved_items_v1';

export function getSavedItems(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read saved items:', err);
    return [];
  }
}

export function saveItem(item: Omit<SavedItem, 'id' | 'timestamp'>): SavedItem {
  const items = getSavedItems();
  const newItem: SavedItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newItem, ...items];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save item:', err);
  }
  return newItem;
}

export function removeItem(id: string): void {
  const items = getSavedItems();
  const updated = items.filter((i) => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove item:', err);
  }
}

export function clearAllSavedItems(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear library:', err);
  }
}
