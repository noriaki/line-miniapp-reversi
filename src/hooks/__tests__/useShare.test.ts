/**
 * useShare Hook Tests
 *
 * Tests for share functionality state management and operations.
 * Requirements: 2.1, 2.2, 2.3, 2.8, 2.9, 2.10, 3.1, 3.4, 6.1, 6.2, 6.3
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useShare } from '../useShare';
import { pendingShareStorage } from '@/lib/share/pending-share-storage';
import * as shareService from '@/lib/share/share-service';
import type { PendingShareData } from '@/lib/share/types';
import type { Board } from '@/lib/game/types';

// Mock dependencies
jest.mock('@/lib/share/pending-share-storage');
jest.mock('@/lib/share/share-service');
jest.mock('@line/liff', () => ({
  __esModule: true,
  default: {
    isLoggedIn: jest.fn(() => false),
    login: jest.fn(),
    isApiAvailable: jest.fn(() => true),
  },
}));

// Mock useLiff
const mockLogin = jest.fn();
let mockIsLoggedIn = false;
const mockIsReady = true;

jest.mock('../useLiff', () => ({
  useLiff: () => ({
    isReady: mockIsReady,
    get isLoggedIn() {
      return mockIsLoggedIn;
    },
    login: mockLogin,
    error: null,
    isInClient: true,
    profile: null,
    logout: jest.fn(),
  }),
}));

// Mock useMessageQueue
const mockAddMessage = jest.fn();
const mockClearMessage = jest.fn();

jest.mock('../useMessageQueue', () => ({
  useMessageQueue: () => ({
    currentMessage: null,
    addMessage: mockAddMessage,
    clearMessage: mockClearMessage,
  }),
}));

const mockedPendingShareStorage = jest.mocked(pendingShareStorage);
const mockedShareService = jest.mocked(shareService);

// Test fixtures
const createTestBoard = (): Board => {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  return board;
};

const createMockPendingShareData = (): PendingShareData => ({
  board: createTestBoard() as unknown as PendingShareData['board'],
  blackCount: 36,
  whiteCount: 28,
  winner: 'black',
  timestamp: Date.now() - 1000, // 1 second ago (valid)
});

describe('useShare', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset login state to default (not logged in)
    mockIsLoggedIn = false;

    // Default mock implementations
    mockedPendingShareStorage.isAvailable.mockReturnValue(true);
    mockedPendingShareStorage.load.mockReturnValue(null);
    mockedPendingShareStorage.save.mockImplementation(() => {});
    mockedPendingShareStorage.clear.mockImplementation(() => {});
    mockedPendingShareStorage.isExpired.mockReturnValue(false);

    // Mock navigator for Web Share API
    Object.defineProperty(global, 'navigator', {
      value: {
        share: jest.fn(),
        canShare: jest.fn(() => true),
      },
      writable: true,
    });
  });

  describe('Task 6.1: State Management', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useShare());

      expect(result.current.isShareReady).toBe(false);
      expect(result.current.isSharing).toBe(false);
      expect(result.current.shareImageUrl).toBeNull();
    });

    it('should detect Web Share API availability', () => {
      const { result } = renderHook(() => useShare());

      expect(result.current.canWebShare).toBe(true);
    });

    it('should set canWebShare to false when Web Share API is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          share: undefined,
          canShare: undefined,
        },
        writable: true,
      });

      const { result } = renderHook(() => useShare());

      expect(result.current.canWebShare).toBe(false);
    });

    it('should provide hasPendingShare as false when no pending data', () => {
      mockedPendingShareStorage.load.mockReturnValue(null);

      const { result } = renderHook(() => useShare());

      expect(result.current.hasPendingShare).toBe(false);
    });

    it('should set isSharing to true during share operation to prevent multiple shares', async () => {
      mockedShareService.shareViaWebShare.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useShare());

      // Set up share ready state
      await act(async () => {
        // Simulate prepared image by mocking prepareShareImage
        mockedShareService.prepareShareImage.mockResolvedValue({
          success: true,
          data: {
            imageUrl: 'https://example.com/image.png',
            imageBlob: new Blob(['test'], { type: 'image/png' }),
          },
        });

        const mockRef = { current: document.createElement('div') };
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      // Start share and check isSharing becomes true
      let sharingPromise: Promise<void>;
      act(() => {
        sharingPromise = result.current.handleWebShare();
      });

      // isSharing should be true while operation is in progress
      expect(result.current.isSharing).toBe(true);

      await act(async () => {
        await sharingPromise;
      });

      // isSharing should be false after operation completes
      expect(result.current.isSharing).toBe(false);
    });
  });

  describe('Task 6.2: Share Operation Handlers', () => {
    it('should call prepareShareImage and update state on success', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      const { result } = renderHook(() => useShare());

      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      expect(result.current.isShareReady).toBe(true);
      expect(result.current.shareImageUrl).toBe(
        'https://example.com/image.png'
      );
    });

    it('should handle LINE share when logged in', async () => {
      // Setup logged in state
      mockIsLoggedIn = true;

      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      mockedShareService.shareViaLine.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useShare());

      // Prepare image first
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      // Call LINE share
      await act(async () => {
        await result.current.handleLineShare();
      });

      expect(mockedShareService.shareViaLine).toHaveBeenCalled();
    });

    it('should save state and call login when not logged in for LINE share', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      const { result } = renderHook(() => useShare());

      // Prepare image first
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      // Call LINE share when not logged in
      await act(async () => {
        await result.current.handleLineShare();
      });

      expect(mockedPendingShareStorage.save).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });

    it('should call Web Share API for handleWebShare', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      mockedShareService.shareViaWebShare.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useShare());

      // Prepare image first
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      await act(async () => {
        await result.current.handleWebShare();
      });

      expect(mockedShareService.shareViaWebShare).toHaveBeenCalled();
    });
  });

  describe('Task 6.3: Login Redirect Share Continuation', () => {
    it('should load pending share data on initialization', () => {
      const pendingData = createMockPendingShareData();
      mockedPendingShareStorage.load.mockReturnValue(pendingData);

      const { result } = renderHook(() => useShare());

      expect(mockedPendingShareStorage.load).toHaveBeenCalled();
      expect(result.current.hasPendingShare).toBe(true);
    });

    it('should clear expired pending share data', () => {
      const expiredData = createMockPendingShareData();
      mockedPendingShareStorage.load.mockReturnValue(expiredData);
      mockedPendingShareStorage.isExpired.mockReturnValue(true);

      const { result } = renderHook(() => useShare());

      expect(mockedPendingShareStorage.clear).toHaveBeenCalled();
      expect(result.current.hasPendingShare).toBe(false);
    });

    it('should clear pending share data after successful share', async () => {
      const pendingData = createMockPendingShareData();
      mockedPendingShareStorage.load.mockReturnValue(pendingData);
      mockedPendingShareStorage.isExpired.mockReturnValue(false);

      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      mockedShareService.shareViaWebShare.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useShare());

      // Prepare and share
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      await act(async () => {
        await result.current.handleWebShare();
      });

      expect(mockedPendingShareStorage.clear).toHaveBeenCalled();
    });

    it('should clear pending share data on user cancel', async () => {
      const pendingData = createMockPendingShareData();
      mockedPendingShareStorage.load.mockReturnValue(pendingData);
      mockedPendingShareStorage.isExpired.mockReturnValue(false);

      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      mockedShareService.shareViaWebShare.mockResolvedValue({
        success: false,
        error: { type: 'cancelled' },
      });

      const { result } = renderHook(() => useShare());

      // Prepare and share
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      await act(async () => {
        await result.current.handleWebShare();
      });

      expect(mockedPendingShareStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Task 6.4: Share Result Notifications', () => {
    it('should show success toast on successful share', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      mockedShareService.shareViaWebShare.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useShare());

      // Prepare and share
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      await act(async () => {
        await result.current.handleWebShare();
      });

      expect(mockAddMessage).toHaveBeenCalledWith({
        type: 'info',
        text: 'シェアしました！',
        timeout: 3000,
      });
    });

    it('should show error toast on share failure', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      mockedShareService.shareViaWebShare.mockResolvedValue({
        success: false,
        error: { type: 'share_failed', message: 'Network error' },
      });

      const { result } = renderHook(() => useShare());

      // Prepare and share
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      await act(async () => {
        await result.current.handleWebShare();
      });

      expect(mockAddMessage).toHaveBeenCalledWith({
        type: 'warning',
        text: 'シェアに失敗しました',
        timeout: 3000,
      });
    });

    it('should not show toast on user cancel', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      mockedShareService.shareViaWebShare.mockResolvedValue({
        success: false,
        error: { type: 'cancelled' },
      });

      const { result } = renderHook(() => useShare());

      // Prepare and share
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      mockAddMessage.mockClear();

      await act(async () => {
        await result.current.handleWebShare();
      });

      // Should not call addMessage for cancel
      expect(mockAddMessage).not.toHaveBeenCalled();
    });

    it('should show error toast on image preparation failure', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: false,
        error: { type: 'upload_failed', message: 'Upload error' },
      });

      const { result } = renderHook(() => useShare());

      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      expect(mockAddMessage).toHaveBeenCalledWith({
        type: 'warning',
        text: '画像の準備に失敗しました',
        timeout: 3000,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not share when image is not ready', async () => {
      const { result } = renderHook(() => useShare());

      await act(async () => {
        await result.current.handleWebShare();
      });

      expect(mockedShareService.shareViaWebShare).not.toHaveBeenCalled();
    });

    it('should not allow multiple concurrent share operations', async () => {
      mockedShareService.prepareShareImage.mockResolvedValue({
        success: true,
        data: {
          imageUrl: 'https://example.com/image.png',
          imageBlob: new Blob(['test'], { type: 'image/png' }),
        },
      });

      // Create a promise that we control
      let resolveShare: () => void;
      const sharePromise = new Promise<void>((resolve) => {
        resolveShare = resolve;
      });

      mockedShareService.shareViaWebShare.mockImplementation(async () => {
        await sharePromise;
        return { success: true, data: undefined };
      });

      const { result } = renderHook(() => useShare());

      // Prepare image
      const mockRef = { current: document.createElement('div') };
      await act(async () => {
        await result.current.prepareShareImage(
          mockRef,
          createTestBoard(),
          36,
          28,
          'black'
        );
      });

      // Start first share
      act(() => {
        result.current.handleWebShare();
      });

      // Try to start second share while first is in progress
      await act(async () => {
        await result.current.handleWebShare();
      });

      // Should only have called share once
      expect(mockedShareService.shareViaWebShare).toHaveBeenCalledTimes(1);

      // Resolve the first share
      act(() => {
        resolveShare!();
      });

      // Wait for the share to complete
      await waitFor(() => {
        expect(result.current.isSharing).toBe(false);
      });
    });
  });
});
