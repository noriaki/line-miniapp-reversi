/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LiffProvider } from '../LiffProvider';
import { useLiff } from '@/hooks/useLiff';
import liff from '@line/liff';

// Type assertion for liff.$mock API (available when @line/liff-mock is installed)
type LiffWithMock = typeof liff & {
  $mock: {
    set: (data: Record<string, unknown>) => void;
    clear: () => void;
  };
};

// Test component that uses useLiff hook
function TestComponent() {
  const { isReady, error, isInClient, isLoggedIn, profile } = useLiff();

  return (
    <div>
      <div data-testid="ready">{isReady ? 'ready' : 'not-ready'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="in-client">
        {isInClient === null ? 'null' : String(isInClient)}
      </div>
      <div data-testid="logged-in">
        {isLoggedIn === null ? 'null' : String(isLoggedIn)}
      </div>
      <div data-testid="profile">
        {profile ? profile.displayName : 'no-profile'}
      </div>
    </div>
  );
}

describe('LiffProvider - Error Handling and Fallback (Task 6)', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    // Task 3.2: Use official Mock API (liff.$mock.clear) instead of jest.clearAllMocks()
    // Clear mock data before each test using official @line/liff-mock API
    (liff as LiffWithMock).$mock.clear();

    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Reset environment
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    // Task 3.2: Clean up mocks using official Mock API (liff.$mock.clear)
    // This ensures test isolation and prevents state leakage between tests
    (liff as LiffWithMock).$mock.clear();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  describe('Task 6.1: LIFF初期化エラーの処理実装', () => {
    it('should display user-friendly error message when LIFF initialization fails', async () => {
      // Note: @line/liff-mock does not support error simulation for init/getProfile
      // We use jest.spyOn for error cases to test business logic (error handling)
      // This is acceptable as we're testing our error handling, not LIFF SDK behavior
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initSpy = jest
        .spyOn(liff, 'init')
        .mockRejectedValue(new Error('Network error'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for initialization attempt and error to be set
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
        expect(screen.getByTestId('error')).toHaveTextContent(
          'LINE integration is unavailable. You can continue playing in normal mode.'
        );
      });

      initSpy.mockRestore();
    });

    it('should log error details to developer console when initialization fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initError = new Error('LIFF SDK initialization error');
      const initSpy = jest.spyOn(liff, 'init').mockRejectedValue(initError);

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'LIFF initialization failed:',
          initError
        );
      });

      initSpy.mockRestore();
    });

    it('should allow game to work normally without LIFF features when initialization fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initSpy = jest
        .spyOn(liff, 'init')
        .mockRejectedValue(new Error('Init failed'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for initialization and verify state
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
        expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
        expect(screen.getByTestId('in-client')).toHaveTextContent('null');
        expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
      });

      initSpy.mockRestore();
    });

    it('should set error state and reflect it in UI when initialization fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initSpy = jest
        .spyOn(liff, 'init')
        .mockRejectedValue(new Error('Test error'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait and verify
      await waitFor(() => {
        const errorElement = screen.getByTestId('error');
        expect(errorElement).not.toHaveTextContent('no-error');
        expect(errorElement.textContent).toBeTruthy();
      });

      initSpy.mockRestore();
    });

    it('should separate LIFF error handling from game error handler', async () => {
      // This test verifies that LIFF errors are handled internally
      // and don't propagate to game error handlers

      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initSpy = jest
        .spyOn(liff, 'init')
        .mockRejectedValue(new Error('LIFF error'));

      // Render - should not throw error or trigger ErrorBoundary
      const { container } = render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // Component should render successfully even with LIFF error
      expect(container.querySelector('[data-testid="ready"]')).toBeTruthy();

      initSpy.mockRestore();
    });
  });

  describe('Task 6.2: プロフィール取得エラーの処理実装', () => {
    it('should record error state when profile retrieval fails', async () => {
      // Setup - Use official Mock API for success path, spy for error
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff as LiffWithMock).$mock.set({
        isInClient: true,
        isLoggedIn: true,
      });
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(new Error('Profile API error'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for profile attempt
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // Verify error is recorded
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Failed to retrieve profile information'
      );

      profileSpy.mockRestore();
    });

    it('should display default icon when profile retrieval fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff as LiffWithMock).$mock.set({
        isInClient: true,
        isLoggedIn: true,
      });
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(new Error('Profile error'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // Verify profile is null (triggers default icon in UI)
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');

      profileSpy.mockRestore();
    });

    it('should log profile error to developer console', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const profileError = new Error('Profile retrieval failed');
      (liff as LiffWithMock).$mock.set({
        isInClient: true,
        isLoggedIn: true,
      });
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(profileError);

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for profile attempt
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Profile retrieval failed:',
          profileError
        );
      });

      profileSpy.mockRestore();
    });

    it('should allow game to continue when profile retrieval fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff as LiffWithMock).$mock.set({
        isInClient: true,
        isLoggedIn: true,
      });
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(new Error('Profile error'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait for initialization and verify LIFF is still enabled
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
        expect(screen.getByTestId('in-client')).toHaveTextContent('true');
        expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
      });

      profileSpy.mockRestore();
    });

    it('should keep LIFF features enabled when only profile fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff as LiffWithMock).$mock.set({
        isInClient: false,
        isLoggedIn: true,
      });
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(new Error('Network timeout'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait and verify LIFF state is correct except for profile
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
        expect(screen.getByTestId('in-client')).toHaveTextContent('false');
        expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
        expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
      });

      profileSpy.mockRestore();
    });
  });

  describe('Task 6.3: 環境変数未設定時のフォールバック処理', () => {
    it('should display warning to console when LIFF_ID is not set', async () => {
      // Setup - no LIFF_ID
      delete process.env.NEXT_PUBLIC_LIFF_ID;

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait and verify warning
      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'LIFF_ID not set: LIFF features are disabled'
        );
      });
    });

    it('should disable LIFF features when LIFF_ID is not set', async () => {
      // Setup
      delete process.env.NEXT_PUBLIC_LIFF_ID;

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // Verify LIFF features are disabled
      expect(screen.getByTestId('in-client')).toHaveTextContent('null');
      expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
    });

    it('should allow normal gameplay when LIFF_ID is not set', async () => {
      // Setup
      delete process.env.NEXT_PUBLIC_LIFF_ID;

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // Verify app is ready for gameplay
      expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('should not attempt LIFF initialization when LIFF_ID is missing', async () => {
      // Setup
      delete process.env.NEXT_PUBLIC_LIFF_ID;

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // Verify no initialization errors occurred
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('in-client')).toHaveTextContent('null');
    });
  });

  describe('Integration: Error Recovery Flow', () => {
    it('should handle complete initialization flow with successful profile retrieval', async () => {
      // Task 3.2: Use official Mock API (liff.$mock.set) to customize mock data
      // This replaces manual Jest mock setup (jest.mock) with official @line/liff-mock API
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff as LiffWithMock).$mock.set({
        isInClient: true,
        isLoggedIn: true,
        getProfile: {
          userId: 'U123',
          displayName: 'Test User',
          pictureUrl: 'https://example.com/pic.jpg',
        },
      });

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait and verify success
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
        expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
      });
    });

    it('should gracefully degrade from init error to fallback mode', async () => {
      // Setup - init fails
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initSpy = jest
        .spyOn(liff, 'init')
        .mockRejectedValue(new Error('Init failed'));

      // Render
      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // Wait and verify fallback mode
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
        expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
        expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
      });

      initSpy.mockRestore();
    });
  });
});
