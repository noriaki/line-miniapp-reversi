/**
 * PendingShareStorage tests
 *
 * Tests for sessionStorage-based game state persistence across login redirects.
 */

import { pendingShareStorage, STORAGE_KEY } from '../pending-share-storage';
import type { PendingShareData } from '../types';
import type { Cell } from '@/lib/game/types';

describe('PendingShareStorage', () => {
  // Create a sample board for testing
  const createSampleBoard = (): Cell[][] => {
    const board: Cell[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null) as Cell[]);
    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';
    return board;
  };

  const sampleData: Omit<PendingShareData, 'timestamp'> = {
    board: createSampleBoard(),
    blackCount: 36,
    whiteCount: 28,
    winner: 'black',
  };

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  describe('STORAGE_KEY', () => {
    it('should be defined as "pendingShareGame"', () => {
      expect(STORAGE_KEY).toBe('pendingShareGame');
    });
  });

  describe('isAvailable', () => {
    it('should return true when sessionStorage is available', () => {
      expect(pendingShareStorage.isAvailable()).toBe(true);
    });

    it('should return false when sessionStorage throws on access', () => {
      // Save original sessionStorage
      const originalSessionStorage = window.sessionStorage;

      // Mock sessionStorage to throw
      Object.defineProperty(window, 'sessionStorage', {
        get: () => {
          throw new Error('Access denied');
        },
        configurable: true,
      });

      expect(pendingShareStorage.isAvailable()).toBe(false);

      // Restore original sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('save', () => {
    it('should save data to sessionStorage with timestamp', () => {
      const beforeSave = Date.now();
      pendingShareStorage.save(sampleData);
      const afterSave = Date.now();

      const stored = sessionStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!) as PendingShareData;
      expect(parsed.board).toEqual(sampleData.board);
      expect(parsed.blackCount).toBe(sampleData.blackCount);
      expect(parsed.whiteCount).toBe(sampleData.whiteCount);
      expect(parsed.winner).toBe(sampleData.winner);
      expect(parsed.timestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(parsed.timestamp).toBeLessThanOrEqual(afterSave);
    });

    it('should overwrite existing data', () => {
      pendingShareStorage.save(sampleData);

      const newData: Omit<PendingShareData, 'timestamp'> = {
        ...sampleData,
        blackCount: 40,
        whiteCount: 24,
        winner: 'white',
      };
      pendingShareStorage.save(newData);

      const stored = sessionStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!) as PendingShareData;
      expect(parsed.blackCount).toBe(40);
      expect(parsed.whiteCount).toBe(24);
      expect(parsed.winner).toBe('white');
    });

    it('should handle draw result', () => {
      const drawData: Omit<PendingShareData, 'timestamp'> = {
        ...sampleData,
        blackCount: 32,
        whiteCount: 32,
        winner: 'draw',
      };
      pendingShareStorage.save(drawData);

      const stored = sessionStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!) as PendingShareData;
      expect(parsed.winner).toBe('draw');
    });
  });

  describe('load', () => {
    it('should return null when no data exists', () => {
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });

    it('should return saved data', () => {
      pendingShareStorage.save(sampleData);
      const result = pendingShareStorage.load();

      expect(result).not.toBeNull();
      expect(result!.board).toEqual(sampleData.board);
      expect(result!.blackCount).toBe(sampleData.blackCount);
      expect(result!.whiteCount).toBe(sampleData.whiteCount);
      expect(result!.winner).toBe(sampleData.winner);
      expect(typeof result!.timestamp).toBe('number');
    });

    it('should return null for invalid JSON', () => {
      sessionStorage.setItem(STORAGE_KEY, 'invalid-json');
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });

    it('should return null for malformed data', () => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ invalid: 'data' }));
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });

    it('should return null for data missing required fields', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          board: createSampleBoard(),
          blackCount: 36,
          // Missing whiteCount, winner, timestamp
        })
      );
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });

    it('should return null when stored value is JSON null', () => {
      sessionStorage.setItem(STORAGE_KEY, 'null');
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });

    it('should return null when blackCount is not a number', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          board: createSampleBoard(),
          blackCount: 'not-a-number',
          whiteCount: 28,
          winner: 'black',
          timestamp: Date.now(),
        })
      );
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });

    it('should return null when winner is invalid', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          board: createSampleBoard(),
          blackCount: 36,
          whiteCount: 28,
          winner: 'invalid-winner',
          timestamp: Date.now(),
        })
      );
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });

    it('should return null when timestamp is not a number', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          board: createSampleBoard(),
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
          timestamp: 'not-a-number',
        })
      );
      const result = pendingShareStorage.load();
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove data from sessionStorage', () => {
      pendingShareStorage.save(sampleData);
      expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

      pendingShareStorage.clear();
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should not throw when no data exists', () => {
      expect(() => pendingShareStorage.clear()).not.toThrow();
    });
  });

  describe('isExpired', () => {
    it('should return false for data within 1 hour', () => {
      const data: PendingShareData = {
        ...sampleData,
        timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      };
      expect(pendingShareStorage.isExpired(data)).toBe(false);
    });

    it('should return false for data exactly at 1 hour boundary', () => {
      const data: PendingShareData = {
        ...sampleData,
        timestamp: Date.now() - 60 * 60 * 1000, // Exactly 1 hour ago
      };
      // At exactly 1 hour, it should NOT be expired (> check, not >=)
      expect(pendingShareStorage.isExpired(data)).toBe(false);
    });

    it('should return true for data older than 1 hour', () => {
      const data: PendingShareData = {
        ...sampleData,
        timestamp: Date.now() - 60 * 60 * 1000 - 1, // 1 hour + 1ms ago
      };
      expect(pendingShareStorage.isExpired(data)).toBe(true);
    });

    it('should return true for data much older than 1 hour', () => {
      const data: PendingShareData = {
        ...sampleData,
        timestamp: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
      };
      expect(pendingShareStorage.isExpired(data)).toBe(true);
    });

    it('should return false for data just saved', () => {
      const data: PendingShareData = {
        ...sampleData,
        timestamp: Date.now(),
      };
      expect(pendingShareStorage.isExpired(data)).toBe(false);
    });
  });

  describe('graceful degradation', () => {
    it('should not throw when sessionStorage is unavailable during save', () => {
      const originalSessionStorage = window.sessionStorage;

      Object.defineProperty(window, 'sessionStorage', {
        get: () => {
          throw new Error('Access denied');
        },
        configurable: true,
      });

      expect(() => pendingShareStorage.save(sampleData)).not.toThrow();

      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });

    it('should return null when sessionStorage is unavailable during load', () => {
      const originalSessionStorage = window.sessionStorage;

      // First save some data
      pendingShareStorage.save(sampleData);

      // Then mock sessionStorage to be unavailable
      Object.defineProperty(window, 'sessionStorage', {
        get: () => {
          throw new Error('Access denied');
        },
        configurable: true,
      });

      expect(pendingShareStorage.load()).toBeNull();

      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });

    it('should not throw when sessionStorage is unavailable during clear', () => {
      const originalSessionStorage = window.sessionStorage;

      Object.defineProperty(window, 'sessionStorage', {
        get: () => {
          throw new Error('Access denied');
        },
        configurable: true,
      });

      expect(() => pendingShareStorage.clear()).not.toThrow();

      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });
  });
});
