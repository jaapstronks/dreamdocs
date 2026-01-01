/**
 * File System Utilities
 * Atomic writes and safe file operations.
 */

import { readFile, writeFile, rename, unlink, mkdir, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Read a JSON file
 * @param path - File path
 * @returns Parsed JSON or null if file doesn't exist
 */
export async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Write a JSON file atomically
 * Writes to a temp file first, then renames to prevent corruption.
 * @param path - File path
 * @param data - Data to write
 */
export async function writeJsonFileAtomic<T>(path: string, data: T): Promise<void> {
  // Ensure directory exists
  await mkdir(dirname(path), { recursive: true });

  // Write to temp file
  const tempPath = `${path}.${randomUUID()}.tmp`;
  await writeFile(tempPath, JSON.stringify(data, null, 2));

  // Rename to final path (atomic on most filesystems)
  await rename(tempPath, path);
}

/**
 * Delete a file if it exists
 * @param path - File path
 * @returns True if file was deleted, false if it didn't exist
 */
export async function deleteFileIfExists(path: string): Promise<boolean> {
  try {
    await unlink(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * List JSON files in a directory
 * @param dirPath - Directory path
 * @returns Array of file paths
 */
export async function listJsonFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await readdir(dirPath);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => join(dirPath, f));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Ensure a directory exists
 * @param dirPath - Directory path
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

/**
 * Check if a file exists
 * @param path - File path
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats or null if file doesn't exist
 * @param path - File path
 */
export async function getFileStats(path: string) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}
