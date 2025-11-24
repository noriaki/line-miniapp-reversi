/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import { LiffContext } from '@/contexts/LiffContext';
import type { LiffContextType } from '@/lib/liff/types';

// Skip the actual useLiff import since it will be tested via LiffProvider integration
describe('useLiff', () => {
  // Note: The actual useLiff hook will be tested indirectly through LiffProvider tests
  // This test file is a placeholder for future detailed testing if needed

  it('should exist as a module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useLiff } = require('../useLiff');
    expect(useLiff).toBeDefined();
    expect(typeof useLiff).toBe('function');
  });

  describe('with LiffContext.Provider', () => {
    it('should return context value when wrapped in provider', () => {
      const mockContextValue: LiffContextType = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
          pictureUrl: 'https://example.com/pic.jpg',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useLiff } = require('../useLiff');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LiffContext.Provider value={mockContextValue}>
          {children}
        </LiffContext.Provider>
      );

      const { result } = renderHook(() => useLiff(), { wrapper });

      expect(result.current).toEqual(mockContextValue);
      expect(result.current.isReady).toBe(true);
      expect(result.current.profile?.displayName).toBe('Test User');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside LiffProvider', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useLiff } = require('../useLiff');

      // This will fail initially - we need to verify error is thrown
      expect(() => {
        renderHook(() => useLiff());
      }).toThrow();
    });

    it('should throw descriptive error message when context is undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useLiff } = require('../useLiff');

      expect(() => {
        renderHook(() => useLiff());
      }).toThrow(/LiffProvider/);
    });
  });
});
