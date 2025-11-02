/**
 * @jest-environment jsdom
 */

import type { LiffClientInterface, Profile } from '../types';

// Mock @line/liff SDK
jest.mock('@line/liff', () => ({
  init: jest.fn(),
  isInClient: jest.fn(),
  isLoggedIn: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn(),
}));

describe('LiffClient', () => {
  let liffClient: LiffClientInterface;
  let mockLiff: {
    init: jest.Mock;
    isInClient: jest.Mock;
    isLoggedIn: jest.Mock;
    login: jest.Mock;
    logout: jest.Mock;
    getProfile: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Get mocked liff
    mockLiff = jest.requireMock('@line/liff');

    // Import LiffClient after mocks are set up
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { LiffClient } = require('../liff-client');
    liffClient = new LiffClient();
  });

  describe('initialize', () => {
    it('should initialize LIFF SDK with provided LIFF ID', async () => {
      mockLiff.init.mockResolvedValue(undefined);
      const liffId = '1234567890-abcdefgh';

      await liffClient.initialize(liffId);

      expect(mockLiff.init).toHaveBeenCalledWith({ liffId });
      expect(mockLiff.init).toHaveBeenCalledTimes(1);
    });

    it('should throw error when initialization fails', async () => {
      const error = new Error('LIFF initialization failed');
      mockLiff.init.mockRejectedValue(error);

      await expect(liffClient.initialize('invalid-id')).rejects.toThrow(
        'LIFF initialization failed'
      );
    });
  });

  describe('isInClient', () => {
    it('should return true when running inside LINE app', () => {
      mockLiff.isInClient.mockReturnValue(true);

      const result = liffClient.isInClient();

      expect(result).toBe(true);
      expect(mockLiff.isInClient).toHaveBeenCalledTimes(1);
    });

    it('should return false when running in external browser', () => {
      mockLiff.isInClient.mockReturnValue(false);

      const result = liffClient.isInClient();

      expect(result).toBe(false);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when user is logged in', () => {
      mockLiff.isLoggedIn.mockReturnValue(true);

      const result = liffClient.isLoggedIn();

      expect(result).toBe(true);
      expect(mockLiff.isLoggedIn).toHaveBeenCalledTimes(1);
    });

    it('should return false when user is not logged in', () => {
      mockLiff.isLoggedIn.mockReturnValue(false);

      const result = liffClient.isLoggedIn();

      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should call LIFF login method', async () => {
      mockLiff.login.mockImplementation(() => {
        // LIFF login redirects, so it doesn't return
      });

      await liffClient.login();

      expect(mockLiff.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should call LIFF logout method', async () => {
      mockLiff.logout.mockImplementation(() => {
        // LIFF logout is synchronous
      });

      await liffClient.logout();

      expect(mockLiff.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProfile', () => {
    it('should return profile information when successful', async () => {
      const mockProfile: Profile = {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/pic.jpg',
        statusMessage: 'Hello',
      };
      mockLiff.getProfile.mockResolvedValue(mockProfile);

      const result = await liffClient.getProfile();

      expect(result).toEqual(mockProfile);
      expect(mockLiff.getProfile).toHaveBeenCalledTimes(1);
    });

    it('should return profile without optional fields', async () => {
      const mockProfile: Profile = {
        userId: 'U1234567890',
        displayName: 'Test User',
      };
      mockLiff.getProfile.mockResolvedValue(mockProfile);

      const result = await liffClient.getProfile();

      expect(result).toEqual(mockProfile);
      expect(result.pictureUrl).toBeUndefined();
      expect(result.statusMessage).toBeUndefined();
    });

    it('should throw error when profile retrieval fails', async () => {
      const error = new Error('Profile retrieval failed');
      mockLiff.getProfile.mockRejectedValue(error);

      await expect(liffClient.getProfile()).rejects.toThrow(
        'Profile retrieval failed'
      );
    });
  });
});
