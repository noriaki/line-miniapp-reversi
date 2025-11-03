import type { Position } from '../types';
import { positionToNotation, generateNotationString } from '../move-history';

describe('Move History', () => {
  describe('positionToNotation', () => {
    describe('boundary value tests', () => {
      it('should convert (0,0) to "a1"', () => {
        const position: Position = { row: 0, col: 0 };
        expect(positionToNotation(position)).toBe('a1');
      });

      it('should convert (7,7) to "h8"', () => {
        const position: Position = { row: 7, col: 7 };
        expect(positionToNotation(position)).toBe('h8');
      });

      it('should convert (2,6) to "g3"', () => {
        const position: Position = { row: 2, col: 6 };
        expect(positionToNotation(position)).toBe('g3');
      });

      it('should convert (3,4) to "e4"', () => {
        const position: Position = { row: 3, col: 4 };
        expect(positionToNotation(position)).toBe('e4');
      });
    });

    describe('full coordinate conversion tests', () => {
      it('should cover all columns a-h', () => {
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const row = 0;

        columns.forEach((expectedCol, colIndex) => {
          const position: Position = { row, col: colIndex };
          const notation = positionToNotation(position);
          expect(notation[0]).toBe(expectedCol);
        });
      });

      it('should cover all rows 1-8', () => {
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const col = 0;

        rows.forEach((expectedRow, rowIndex) => {
          const position: Position = { row: rowIndex, col };
          const notation = positionToNotation(position);
          expect(notation[1]).toBe(expectedRow);
        });
      });
    });

    describe('invalid position tests', () => {
      it('should return "??" for negative row', () => {
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();
        const position: Position = { row: -1, col: 0 };
        expect(positionToNotation(position)).toBe('??');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid position: row=-1, col=0'
        );
        consoleErrorSpy.mockRestore();
      });

      it('should return "??" for row > 7', () => {
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();
        const position: Position = { row: 8, col: 0 };
        expect(positionToNotation(position)).toBe('??');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid position: row=8, col=0'
        );
        consoleErrorSpy.mockRestore();
      });

      it('should return "??" for negative col', () => {
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();
        const position: Position = { row: 0, col: -1 };
        expect(positionToNotation(position)).toBe('??');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid position: row=0, col=-1'
        );
        consoleErrorSpy.mockRestore();
      });

      it('should return "??" for col > 7', () => {
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();
        const position: Position = { row: 0, col: 8 };
        expect(positionToNotation(position)).toBe('??');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid position: row=0, col=8'
        );
        consoleErrorSpy.mockRestore();
      });

      it('should return "??" for both row and col out of bounds', () => {
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();
        const position: Position = { row: -1, col: 10 };
        expect(positionToNotation(position)).toBe('??');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid position: row=-1, col=10'
        );
        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe('generateNotationString', () => {
    describe('basic case tests', () => {
      it('should return empty string for empty array', () => {
        const history: readonly string[] = [];
        expect(generateNotationString(history)).toBe('');
      });

      it('should return single notation for array with one move', () => {
        const history: readonly string[] = ['e6'];
        expect(generateNotationString(history)).toBe('e6');
      });

      it('should concatenate multiple moves without separator', () => {
        const history: readonly string[] = ['e6', 'f6', 'f5'];
        expect(generateNotationString(history)).toBe('e6f6f5');
      });

      it('should handle longer sequence correctly', () => {
        const history: readonly string[] = ['e6', 'f6', 'f5', 'd6'];
        expect(generateNotationString(history)).toBe('e6f6f5d6');
      });
    });

    describe('edge case tests', () => {
      it('should handle long history (60+ moves) correctly', () => {
        // Generate 64 moves (full board)
        const moves: string[] = [];
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            moves.push(columns[i] + rows[j]);
          }
        }

        const history: readonly string[] = moves;
        const result = generateNotationString(history);

        // Verify length: 64 moves * 2 characters = 128 characters
        expect(result).toHaveLength(128);
        // Verify it starts correctly
        expect(result.startsWith('a1a2a3a4a5a6a7a8')).toBe(true);
        // Verify it ends correctly
        expect(result.endsWith('h1h2h3h4h5h6h7h8')).toBe(true);
      });
    });

    describe('performance tests', () => {
      it('should generate 60-move notation string in less than 1ms', () => {
        // Generate realistic 60-move game history
        const moves: string[] = [];
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

        // Create 60 moves (typical full game)
        for (let i = 0; i < 60; i++) {
          const col = columns[i % 8];
          const row = rows[Math.floor(i / 8) % 8];
          moves.push(col + row);
        }

        const history: readonly string[] = moves;

        // Measure performance
        const startTime = performance.now();
        const result = generateNotationString(history);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Verify correctness
        expect(result).toHaveLength(120); // 60 moves * 2 characters
        expect(result.startsWith('a1b1c1')).toBe(true); // First 3 moves: a1, b1, c1

        // Verify performance: should complete in less than 1ms
        expect(duration).toBeLessThan(1);
      });
    });
  });
});
