/**
 * Unit tests for useShare hook
 * Tests share state management, exclusion control, and toast notifications
 */

import { renderHook, act } from '@testing-library/react';
import { useShare } from '../useShare';
import type { ShareResult } from '@/lib/share/flex-message-builder';
import * as shareService from '@/lib/share/share-service';

// Mock share service
jest.mock('@/lib/share/share-service', () => ({
  canShareToLine: jest.fn(),
  canShareToWeb: jest.fn(),
  shareToLine: jest.fn(),
  shareToWeb: jest.fn(),
}));

// Mock useMessageQueue
const mockAddMessage = jest.fn();
jest.mock('../useMessageQueue', () => ({
  useMessageQueue: () => ({
    currentMessage: null,
    addMessage: mockAddMessage,
    clearMessage: jest.fn(),
  }),
}));

// Mock useLiff to provide LIFF context
jest.mock('../useLiff', () => ({
  useLiff: () => ({
    isReady: true,
    error: null,
    isInClient: false,
    isLoggedIn: true,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('useShare', () => {
  const baseUrl = 'https://example.com';
  const liffId = 'test-liff-id';
  const config = { baseUrl, liffId };

  const mockResult: ShareResult = {
    encodedMoves: 'ABC123',
    side: 'b',
    blackCount: 36,
    whiteCount: 28,
    winner: 'black',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (shareService.canShareToLine as jest.Mock).mockReturnValue(true);
    (shareService.canShareToWeb as jest.Mock).mockReturnValue(true);
  });

  describe('initialization', () => {
    it('should initialize with isSharing false', () => {
      const { result } = renderHook(() => useShare(config));

      expect(result.current.isSharing).toBe(false);
    });

    it('should check LINE share availability', () => {
      (shareService.canShareToLine as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useShare(config));

      expect(result.current.canShareLine).toBe(true);
    });

    it('should check Web Share availability', () => {
      (shareService.canShareToWeb as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useShare(config));

      expect(result.current.canShareWeb).toBe(true);
    });

    it('should return false for canShareLine when API unavailable', () => {
      (shareService.canShareToLine as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useShare(config));

      expect(result.current.canShareLine).toBe(false);
    });

    it('should return false for canShareWeb when API unavailable', () => {
      (shareService.canShareToWeb as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useShare(config));

      expect(result.current.canShareWeb).toBe(false);
    });
  });

  describe('shareToLine', () => {
    it('should set isSharing to true while sharing', async () => {
      let resolveShare: () => void;
      const sharePromise = new Promise<void>((resolve) => {
        resolveShare = resolve;
      });
      (shareService.shareToLine as jest.Mock).mockReturnValue(
        sharePromise.then(() => ({ status: 'success' }))
      );

      const { result } = renderHook(() => useShare(config));

      act(() => {
        result.current.shareToLine(mockResult);
      });

      expect(result.current.isSharing).toBe(true);

      await act(async () => {
        resolveShare!();
        await sharePromise;
      });

      expect(result.current.isSharing).toBe(false);
    });

    it('should show success toast on successful share', async () => {
      (shareService.shareToLine as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      const { result } = renderHook(() => useShare(config));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          text: expect.stringContaining('シェア'),
        })
      );
    });

    it('should not show toast on cancellation', async () => {
      (shareService.shareToLine as jest.Mock).mockResolvedValue({
        status: 'cancelled',
      });

      const { result } = renderHook(() => useShare(config));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      expect(mockAddMessage).not.toHaveBeenCalled();
    });

    it('should show error toast on share failure', async () => {
      (shareService.shareToLine as jest.Mock).mockResolvedValue({
        status: 'error',
        message: 'Share failed',
      });

      const { result } = renderHook(() => useShare(config));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
        })
      );
    });

    it('should prevent concurrent shares', async () => {
      let resolveShare: () => void;
      const sharePromise = new Promise<void>((resolve) => {
        resolveShare = resolve;
      });
      (shareService.shareToLine as jest.Mock).mockReturnValue(
        sharePromise.then(() => ({ status: 'success' }))
      );

      const { result } = renderHook(() => useShare(config));

      // Start first share
      act(() => {
        result.current.shareToLine(mockResult);
      });

      // Try second share while first is in progress
      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      // Only one call should have been made
      expect(shareService.shareToLine).toHaveBeenCalledTimes(1);

      // Cleanup
      await act(async () => {
        resolveShare!();
        await sharePromise;
      });
    });

    it('should build and pass homeUrl to shareService', async () => {
      (shareService.shareToLine as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      const { result } = renderHook(() => useShare(config));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      // Verify shareToLine was called with correct URL parameters including homeUrl
      expect(shareService.shareToLine).toHaveBeenCalledWith(
        mockResult,
        // permalink URL (miniapp.line.me with full path)
        expect.stringContaining('miniapp.line.me/test-liff-id/r/'),
        // OG image URL (endpoint)
        expect.stringContaining('/opengraph-image'),
        // home URL (miniapp.line.me with just liffId)
        `https://miniapp.line.me/${liffId}`
      );
    });
  });

  describe('shareToWeb', () => {
    it('should set isSharing to true while sharing', async () => {
      let resolveShare: () => void;
      const sharePromise = new Promise<void>((resolve) => {
        resolveShare = resolve;
      });
      (shareService.shareToWeb as jest.Mock).mockReturnValue(
        sharePromise.then(() => ({ status: 'success' }))
      );

      const { result } = renderHook(() => useShare(config));

      act(() => {
        result.current.shareToWeb(mockResult);
      });

      expect(result.current.isSharing).toBe(true);

      await act(async () => {
        resolveShare!();
        await sharePromise;
      });

      expect(result.current.isSharing).toBe(false);
    });

    it('should show success toast on successful share', async () => {
      (shareService.shareToWeb as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      const { result } = renderHook(() => useShare(config));

      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          text: expect.stringContaining('シェア'),
        })
      );
    });

    it('should not show toast on cancellation', async () => {
      (shareService.shareToWeb as jest.Mock).mockResolvedValue({
        status: 'cancelled',
      });

      const { result } = renderHook(() => useShare(config));

      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      expect(mockAddMessage).not.toHaveBeenCalled();
    });

    it('should show error toast on share failure', async () => {
      (shareService.shareToWeb as jest.Mock).mockResolvedValue({
        status: 'error',
        message: 'Share failed',
      });

      const { result } = renderHook(() => useShare(config));

      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
        })
      );
    });

    it('should prevent concurrent shares', async () => {
      let resolveShare: () => void;
      const sharePromise = new Promise<void>((resolve) => {
        resolveShare = resolve;
      });
      (shareService.shareToWeb as jest.Mock).mockReturnValue(
        sharePromise.then(() => ({ status: 'success' }))
      );

      const { result } = renderHook(() => useShare(config));

      // Start first share
      act(() => {
        result.current.shareToWeb(mockResult);
      });

      // Try second share while first is in progress
      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      // Only one call should have been made
      expect(shareService.shareToWeb).toHaveBeenCalledTimes(1);

      // Cleanup
      await act(async () => {
        resolveShare!();
        await sharePromise;
      });
    });
  });

  describe('cross-share exclusion', () => {
    it('should prevent Web Share while LINE share is in progress', async () => {
      let resolveLineShare: () => void;
      const lineSharePromise = new Promise<void>((resolve) => {
        resolveLineShare = resolve;
      });
      (shareService.shareToLine as jest.Mock).mockReturnValue(
        lineSharePromise.then(() => ({ status: 'success' }))
      );

      const { result } = renderHook(() => useShare(config));

      // Start LINE share
      act(() => {
        result.current.shareToLine(mockResult);
      });

      // Try Web share while LINE share is in progress
      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      // Web share should not have been called
      expect(shareService.shareToWeb).not.toHaveBeenCalled();

      // Cleanup
      await act(async () => {
        resolveLineShare!();
        await lineSharePromise;
      });
    });

    it('should prevent LINE Share while Web share is in progress', async () => {
      let resolveWebShare: () => void;
      const webSharePromise = new Promise<void>((resolve) => {
        resolveWebShare = resolve;
      });
      (shareService.shareToWeb as jest.Mock).mockReturnValue(
        webSharePromise.then(() => ({ status: 'success' }))
      );

      const { result } = renderHook(() => useShare(config));

      // Start Web share
      act(() => {
        result.current.shareToWeb(mockResult);
      });

      // Try LINE share while Web share is in progress
      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      // LINE share should not have been called
      expect(shareService.shareToLine).not.toHaveBeenCalled();

      // Cleanup
      await act(async () => {
        resolveWebShare!();
        await webSharePromise;
      });
    });
  });

  describe('message queue', () => {
    it('should return message queue for external use', () => {
      const { result } = renderHook(() => useShare(config));

      expect(result.current.messageQueue).toBeDefined();
      expect(result.current.messageQueue.addMessage).toBe(mockAddMessage);
    });
  });
});
