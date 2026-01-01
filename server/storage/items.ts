/**
 * Items Storage
 * File-based JSON storage for items.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const ITEMS_FILE = join(DATA_DIR, 'items.json');

export interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

/**
 * Read items from file
 */
async function readItems(): Promise<Item[]> {
  try {
    const content = await readFile(ITEMS_FILE, 'utf-8');
    return JSON.parse(content) as Item[];
  } catch {
    return [];
  }
}

/**
 * Write items to file
 */
async function writeItems(items: Item[]): Promise<void> {
  await ensureDataDir();
  await writeFile(ITEMS_FILE, JSON.stringify(items, null, 2));
}

/**
 * List all items
 */
export async function listItems(): Promise<Item[]> {
  return readItems();
}

/**
 * Get a single item by ID
 */
export async function getItem(id: string): Promise<Item | null> {
  const items = await readItems();
  return items.find((item) => item.id === id) || null;
}

/**
 * Create a new item
 */
export async function createItem(data: { name: string; description: string }): Promise<Item> {
  const items = await readItems();

  const now = new Date().toISOString();
  const item: Item = {
    id: randomUUID(),
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
  };

  items.push(item);
  await writeItems(items);

  return item;
}

/**
 * Update an existing item
 */
export async function updateItem(id: string, data: { name: string; description: string }): Promise<Item | null> {
  const items = await readItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updated: Item = {
    ...items[index],
    name: data.name,
    description: data.description,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updated;
  await writeItems(items);

  return updated;
}

/**
 * Delete an item
 */
export async function deleteItem(id: string): Promise<boolean> {
  const items = await readItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  await writeItems(items);

  return true;
}
