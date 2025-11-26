/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const { isReady, error, isInClient, isLoggedIn, profile, login, logout } =
    useLiff();

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
      <button data-testid="login-btn" onClick={login}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('LiffProvider - Business Logic Tests', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    // Clear mock data before each test using official @line/liff-mock API
    (liff as LiffWithMock).$mock.clear();

    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Reset environment
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    // Clean up mocks using official Mock API
    (liff as LiffWithMock).$mock.clear();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  describe('When LIFF_ID is not set', () => {
    it('should output warning log when LIFF_ID is not set', async () => {
      delete process.env.NEXT_PUBLIC_LIFF_ID;

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'LIFF_ID not set: LIFF features are disabled'
        );
      });
    });

    it('should enter LIFF disabled mode when LIFF_ID is not set', async () => {
      delete process.env.NEXT_PUBLIC_LIFF_ID;

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // LIFF disabled mode: all LIFF features are null
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('in-client')).toHaveTextContent('null');
      expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
    });
  });

  describe('Successful initialization flow', () => {
    it('should successfully initialize and retrieve isInClient status', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock liff.init to resolve successfully
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      // Use jest.spyOn for success path (liff.$mock.set doesn't work for isInClient/isLoggedIn)
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(false);

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // React 19 Compatibility: Wait for ready state first
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for all state updates to complete
      await waitFor(() => {
        expect(screen.getByTestId('in-client')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('logged-in')).toHaveTextContent('false');

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
    });

    it('should successfully retrieve isLoggedIn status', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock liff.init to resolve successfully
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      // Use jest.spyOn for success path
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(false);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      // React 19 Compatibility: Wait for ready state first
      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for all state updates to complete
      await waitFor(() => {
        expect(screen.getByTestId('in-client')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('logged-in')).toHaveTextContent('true');

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
    });

    it('should retrieve profile when logged in', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock liff.init to resolve successfully
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      // Use jest.spyOn for success path (liff.$mock.set doesn't work for getProfile)
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);
      const getProfileSpy = jest.spyOn(liff, 'getProfile').mockResolvedValue({
        userId: 'U123456',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/pic.jpg',
        statusMessage: 'Hello!',
      });

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for profile to be loaded after async getProfile call
      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no-error');

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      getProfileSpy.mockRestore();
    });

    it('should not retrieve profile when not logged in', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock liff.init to resolve successfully
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      // Use jest.spyOn for success path
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(false);

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for all state updates to complete
      await waitFor(() => {
        expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
    });
  });

  describe('Initialization failure flow', () => {
    it('should set error message when initialization fails', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initSpy = jest
        .spyOn(liff, 'init')
        .mockRejectedValue(new Error('Network error'));

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for error state update after init failure
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'LINE integration is unavailable. You can continue playing in normal mode.'
        );
      });

      initSpy.mockRestore();
    });

    it('should enter fallback mode when initialization fails', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initSpy = jest
        .spyOn(liff, 'init')
        .mockRejectedValue(new Error('Init failed'));

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for error state to be set after init failure
      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
      });

      // Fallback mode: ready=true, error is set, LIFF features are null
      expect(screen.getByTestId('in-client')).toHaveTextContent('null');
      expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');

      initSpy.mockRestore();
    });

    it('should log initialization error to console', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const initError = new Error('LIFF SDK initialization error');
      const initSpy = jest.spyOn(liff, 'init').mockRejectedValue(initError);

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'LIFF initialization failed:',
          initError
        );
      });

      initSpy.mockRestore();
    });
  });

  describe('Profile retrieval failure flow', () => {
    it('should set error message when profile retrieval fails', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock all LIFF methods to ensure init succeeds and avoid network errors
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(new Error('Profile API error'));

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for error state update after profile failure
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to retrieve profile information'
        );
      });

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      profileSpy.mockRestore();
    });

    it('should display default icon when profile retrieval fails', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock all LIFF methods to ensure init succeeds
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(new Error('Profile error'));

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // Profile is null, which triggers default icon display in UI
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      profileSpy.mockRestore();
    });

    it('should log profile error to console', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
      const profileError = new Error('Profile retrieval failed');

      // Mock all LIFF methods to ensure init succeeds
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(profileError);

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Profile retrieval failed:',
          profileError
        );
      });

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      profileSpy.mockRestore();
    });

    it('should keep LIFF features enabled when only profile fails', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock all LIFF methods to ensure init succeeds
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(false);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);
      const profileSpy = jest
        .spyOn(liff, 'getProfile')
        .mockRejectedValue(new Error('Network timeout'));

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for all LIFF state updates to complete
      await waitFor(() => {
        expect(screen.getByTestId('in-client')).toHaveTextContent('false');
      });

      // LIFF state is correct except for profile
      expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      profileSpy.mockRestore();
    });
  });

  describe('login/logout function behavior', () => {
    it('should call liff.login() when login function is invoked', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock all LIFF methods to ensure init succeeds
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(false);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(false);
      const loginSpy = jest.spyOn(liff, 'login').mockImplementation();

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      expect(loginSpy).toHaveBeenCalled();

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      loginSpy.mockRestore();
    });

    it('should throw error when login is called before initialization', () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Delay initialization to keep isReady=false
      const initSpy = jest.spyOn(liff, 'init').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      const loginSpy = jest.spyOn(liff, 'login').mockImplementation();

      const TestComponentWithError = () => {
        const { login, isReady } = useLiff();

        if (!isReady) {
          // Try to login before ready
          expect(() => login()).toThrow('LIFF not initialized');
        }

        return <div data-testid="test">Test</div>;
      };

      render(
        <LiffProvider>
          <TestComponentWithError />
        </LiffProvider>
      );

      initSpy.mockRestore();
      loginSpy.mockRestore();
    });

    it('should call liff.logout() when logout function is invoked', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock all LIFF methods to ensure init succeeds
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);
      const getProfileSpy = jest.spyOn(liff, 'getProfile').mockResolvedValue({
        userId: 'U123456',
        displayName: 'Test User',
      });
      const logoutSpy = jest.spyOn(liff, 'logout').mockImplementation();

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      expect(logoutSpy).toHaveBeenCalled();

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      getProfileSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should clear profile and update login status after logout', async () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Mock all LIFF methods to ensure init succeeds
      const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
      const isInClientSpy = jest
        .spyOn(liff, 'isInClient')
        .mockReturnValue(true);
      const isLoggedInSpy = jest
        .spyOn(liff, 'isLoggedIn')
        .mockReturnValue(true);
      const getProfileSpy = jest.spyOn(liff, 'getProfile').mockResolvedValue({
        userId: 'U123456',
        displayName: 'Test User',
      });
      const logoutSpy = jest.spyOn(liff, 'logout').mockImplementation();

      render(
        <LiffProvider>
          <TestComponent />
        </LiffProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toHaveTextContent('ready');
      });

      // React 19 Compatibility: Wait for profile to be loaded after initialization
      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
      });

      // Verify logged in with profile
      expect(screen.getByTestId('logged-in')).toHaveTextContent('true');

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      // Verify logout clears profile and updates status
      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
        expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
      });

      initSpy.mockRestore();
      isInClientSpy.mockRestore();
      isLoggedInSpy.mockRestore();
      getProfileSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should throw error when logout is called before initialization', () => {
      process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

      // Delay initialization to keep isReady=false
      const initSpy = jest.spyOn(liff, 'init').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      const logoutSpy = jest.spyOn(liff, 'logout').mockImplementation();

      const TestComponentWithError = () => {
        const { logout, isReady } = useLiff();

        if (!isReady) {
          // Try to logout before ready
          expect(() => logout()).toThrow('LIFF not initialized');
        }

        return <div data-testid="test">Test</div>;
      };

      render(
        <LiffProvider>
          <TestComponentWithError />
        </LiffProvider>
      );

      initSpy.mockRestore();
      logoutSpy.mockRestore();
    });
  });
});
