/**
 * PendingShareStorage - sessionStorage-based game state persistence
 *
 * Persists game end state across LIFF login redirects to enable
 * share flow continuation after authentication.
 */

import type { PendingShareData } from './types';

/**
 * Storage key for pending share data
 */
export const STORAGE_KEY = 'pendingShareGame' as const;

/**
 * Expiration time in milliseconds (1 hour)
 */
const EXPIRATION_MS = 60 * 60 * 1000; // 3600000ms

/**
 * Type guard to validate PendingShareData structure
 */
function isValidPendingShareData(data: unknown): data is PendingShareData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (!Array.isArray(obj.board)) {
    return false;
  }

  if (typeof obj.blackCount !== 'number') {
    return false;
  }

  if (typeof obj.whiteCount !== 'number') {
    return false;
  }

  if (
    obj.winner !== 'black' &&
    obj.winner !== 'white' &&
    obj.winner !== 'draw'
  ) {
    return false;
  }

  if (typeof obj.timestamp !== 'number') {
    return false;
  }

  return true;
}

/**
 * Check if sessionStorage is available
 * Handles private browsing and other restricted environments
 */
function checkStorageAvailability(): boolean {
  try {
    const testKey = '__test_storage__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * PendingShareStorage implementation
 */
export const pendingShareStorage = {
  /**
   * Check if sessionStorage is available
   * @returns true if sessionStorage is available, false otherwise
   */
  isAvailable(): boolean {
    return checkStorageAvailability();
  },

  /**
   * Save game end state to sessionStorage
   * If sessionStorage is unavailable, silently does nothing (graceful degradation)
   *
   * @param data Game end state without timestamp
   */
  save(data: Omit<PendingShareData, 'timestamp'>): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const dataWithTimestamp: PendingShareData = {
        ...data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
    } catch {
      // Silently fail for graceful degradation
    }
  },

  /**
   * Load saved game end state from sessionStorage
   * Returns null if no data exists, data is invalid, or storage is unavailable
   *
   * @returns Saved data or null
   */
  load(): PendingShareData | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed: unknown = JSON.parse(stored);
      if (!isValidPendingShareData(parsed)) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },

  /**
   * Clear saved data from sessionStorage
   */
  clear(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail for graceful degradation
    }
  },

  /**
   * Check if saved data has expired (older than 1 hour)
   *
   * @param data Saved data to check
   * @returns true if data is expired (older than 1 hour)
   */
  isExpired(data: PendingShareData): boolean {
    const elapsed = Date.now() - data.timestamp;
    return elapsed > EXPIRATION_MS;
  },
};
