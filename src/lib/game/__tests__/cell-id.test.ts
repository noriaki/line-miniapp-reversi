/**
 * Unit tests for Cell ID generation

 *

 *
 * Tests the generateCellId function which converts board indices to
 * chess notation format IDs for HTML elements.
 *
 * Important: This codebase uses the following mapping:
 *   - colIndex (0-7) → column letter (a-h) (horizontal, left→right)
 *   - rowIndex (0-7) → row number (1-8) (vertical, top→bottom)
 * This follows standard chess notation where columns are horizontal (a-h) and rows are vertical (1-8)
 */

import { generateCellId } from '../cell-id';

describe('generateCellId', () => {
  describe('Boundary value tests', () => {
    test('should generate "a1" for top-left corner (rowIndex=0, colIndex=0)', () => {
      // 左上隅セルに`id="a1"`
      const cellId = generateCellId(0, 0);
      expect(cellId).toBe('a1');
    });

    test('should generate "h8" for bottom-right corner (rowIndex=7, colIndex=7)', () => {
      // 右下隅セルに`id="h8"`
      const cellId = generateCellId(7, 7);
      expect(cellId).toBe('h8');
    });

    test('should generate "h1" for top-right corner (rowIndex=0, colIndex=7)', () => {
      const cellId = generateCellId(0, 7);
      expect(cellId).toBe('h1');
    });

    test('should generate "a8" for bottom-left corner (rowIndex=7, colIndex=0)', () => {
      const cellId = generateCellId(7, 0);
      expect(cellId).toBe('a8');
    });
  });

  describe('Middle value tests', () => {
    test('should generate "d3" for middle cell (rowIndex=2, colIndex=3)', () => {
      // ID形式 `{列文字}{行数字}`
      // colIndex=3 → column 'd' (horizontal position)
      // rowIndex=2 → row '3' (vertical position)
      const cellId = generateCellId(2, 3);
      expect(cellId).toBe('d3');
    });

    test('should generate "f5" for middle cell (rowIndex=4, colIndex=5)', () => {
      const cellId = generateCellId(4, 5);
      expect(cellId).toBe('f5');
    });

    test('should generate "e4" for center cell (rowIndex=3, colIndex=4)', () => {
      const cellId = generateCellId(3, 4);
      expect(cellId).toBe('e4');
    });
  });

  describe('All 64 cells uniqueness test', () => {
    test('should generate unique IDs for all 64 cells', () => {
      // 8×8の各セルに一意のid属性を生成
      const ids = new Set<string>();

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cellId = generateCellId(row, col);
          ids.add(cellId);
        }
      }

      // All 64 cells should have unique IDs
      expect(ids.size).toBe(64);
    });
  });

  describe('ID format validation test', () => {
    test('should generate ID of exactly 2 characters', () => {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cellId = generateCellId(row, col);
          expect(cellId.length).toBe(2);
        }
      }
    });
  });

  describe('Consistency with existing code', () => {
    test('should match positionToNotation mapping for sample positions', () => {
      // Verify consistency with corrected move-history.ts positionToNotation function
      // positionToNotation({ row: 0, col: 0 }) should return "a1"
      expect(generateCellId(0, 0)).toBe('a1');

      // positionToNotation({ row: 7, col: 7 }) should return "h8"
      expect(generateCellId(7, 7)).toBe('h8');

      // positionToNotation({ row: 2, col: 6 }) should return "g3"
      expect(generateCellId(2, 6)).toBe('g3');

      // Corrected mapping: row=2, col=3 → "d3"
      expect(generateCellId(2, 3)).toBe('d3');
    });
  });
});
