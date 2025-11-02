/**
 * Integration tests for AI module exports
 * Ensures all exports from index.ts are accessible and functional
 */

import { AIEngine, isModuleReady, decodeResponse } from '../index';

describe('AI Module Exports', () => {
  describe('Class Exports', () => {
    it('should export AIEngine class', () => {
      expect(AIEngine).toBeDefined();
      expect(typeof AIEngine).toBe('function');

      const engine = new AIEngine();
      expect(engine).toBeInstanceOf(AIEngine);
      engine.dispose();
    });
  });

  describe('Integration', () => {
    it('should allow AIEngine to be instantiated and used', () => {
      const engine = new AIEngine('/test-worker.js');

      expect(engine.isReady()).toBe(false);

      engine.dispose();
    });

    it('should allow decodeResponse to work with valid input', () => {
      // FIXED: Use _ai_js response format
      // Row 3, Col 3 → index 27 → bit position 36
      // policy = 36, value = 5
      // encoded = 1000*(63-36)+100+5 = 27105
      const result = decodeResponse(27105);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.row).toBe(3);
        expect(result.value.col).toBe(3);
      }
    });

    it('should allow isModuleReady to check module validity', () => {
      expect(isModuleReady(null)).toBe(false);
      expect(isModuleReady(undefined)).toBe(false);
    });
  });
});
