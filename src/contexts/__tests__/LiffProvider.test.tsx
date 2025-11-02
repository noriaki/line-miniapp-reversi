/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LiffProvider } from '../LiffProvider';
import { useLiff } from '@/hooks/useLiff';
import liff from '@line/liff';

// Mock @line/liff SDK (default export)
jest.mock('@line/liff', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    isInClient: jest.fn(),
    isLoggedIn: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}));

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
    jest.clearAllMocks();
    // Note: Don't call jest.resetModules() as it clears the mock setup

    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Reset environment
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  describe('Task 6.1: LIFF初期化エラーの処理実装', () => {
    it('should display user-friendly error message when LIFF initialization fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initError = new Error('Network error');
      (liff.init as jest.Mock).mockRejectedValue(initError);

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
    });

    it('should log error details to developer console when initialization fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initError = new Error('LIFF SDK initialization error');
      (liff.init as jest.Mock).mockRejectedValue(initError);

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
    });

    it('should allow game to work normally without LIFF features when initialization fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockRejectedValue(new Error('Init failed'));

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
    });

    it('should set error state and reflect it in UI when initialization fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockRejectedValue(new Error('Test error'));

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
    });

    it('should separate LIFF error handling from game error handler', async () => {
      // This test verifies that LIFF errors are handled internally
      // and don't propagate to game error handlers

      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockRejectedValue(new Error('LIFF error'));

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
    });
  });

  describe('Task 6.2: プロフィール取得エラーの処理実装', () => {
    it('should record error state when profile retrieval fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockResolvedValue(undefined);
      (liff.isInClient as jest.Mock).mockReturnValue(true);
      (liff.isLoggedIn as jest.Mock).mockReturnValue(true);
      (liff.getProfile as jest.Mock).mockRejectedValue(
        new Error('Profile API error')
      );

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
    });

    it('should display default icon when profile retrieval fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockResolvedValue(undefined);
      (liff.isInClient as jest.Mock).mockReturnValue(true);
      (liff.isLoggedIn as jest.Mock).mockReturnValue(true);
      (liff.getProfile as jest.Mock).mockRejectedValue(
        new Error('Profile error')
      );

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
    });

    it('should log profile error to developer console', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const profileError = new Error('Profile retrieval failed');
      (liff.init as jest.Mock).mockResolvedValue(undefined);
      (liff.isInClient as jest.Mock).mockReturnValue(true);
      (liff.isLoggedIn as jest.Mock).mockReturnValue(true);
      (liff.getProfile as jest.Mock).mockRejectedValue(profileError);

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
    });

    it('should allow game to continue when profile retrieval fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockResolvedValue(undefined);
      (liff.isInClient as jest.Mock).mockReturnValue(true);
      (liff.isLoggedIn as jest.Mock).mockReturnValue(true);
      (liff.getProfile as jest.Mock).mockRejectedValue(
        new Error('Profile error')
      );

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
    });

    it('should keep LIFF features enabled when only profile fails', async () => {
      // Setup
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockResolvedValue(undefined);
      (liff.isInClient as jest.Mock).mockReturnValue(false);
      (liff.isLoggedIn as jest.Mock).mockReturnValue(true);
      (liff.getProfile as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

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

      // Verify liff.init was never called
      expect(liff.init as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe('Integration: Error Recovery Flow', () => {
    it('should handle complete initialization flow with successful profile retrieval', async () => {
      // Setup - success case
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      (liff.init as jest.Mock).mockResolvedValue(undefined);
      (liff.isInClient as jest.Mock).mockReturnValue(true);
      (liff.isLoggedIn as jest.Mock).mockReturnValue(true);
      (liff.getProfile as jest.Mock).mockResolvedValue({
        userId: 'U123',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/pic.jpg',
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
      (liff.init as jest.Mock).mockRejectedValue(new Error('Init failed'));

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

      // Verify profile was never attempted
      expect(liff.getProfile as jest.Mock).not.toHaveBeenCalled();
    });
  });
});
