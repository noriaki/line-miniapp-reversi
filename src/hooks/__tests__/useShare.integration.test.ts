/**
 * Integration tests for useShare hook with ShareService
 * Tests the complete share flow including service calls and state management
 */

import { renderHook, act } from '@testing-library/react';
import { useShare } from '../useShare';
import type { ShareResult } from '@/lib/share/flex-message-builder';
import { buildFlexMessage } from '@/lib/share/flex-message-builder';
import liff from '@line/liff';

// We test the actual integration between useShare and shareService
// Only external dependencies (LIFF, navigator) are mocked

// Mock LIFF module
jest.mock('@line/liff', () => ({
  isApiAvailable: jest.fn(),
  shareTargetPicker: jest.fn(),
}));

// Get mocked liff for type-safe access
const mockedLiff = jest.mocked(liff);

// Mock useMessageQueue to capture toast messages
const mockMessages: Array<{ type: string; text: string; timeout: number }> = [];
const mockAddMessage = jest.fn((msg) => mockMessages.push(msg));
jest.mock('../useMessageQueue', () => ({
  useMessageQueue: () => ({
    currentMessage: null,
    addMessage: mockAddMessage,
    clearMessage: jest.fn(),
  }),
}));

describe('useShare Integration', () => {
  const baseUrl = 'https://example.com';
  const mockResult: ShareResult = {
    encodedMoves: 'MzQzMzIx', // Valid encoded moves
    side: 'b',
    blackCount: 36,
    whiteCount: 28,
    winner: 'black',
  };

  // Mock navigator.share
  const originalNavigator = global.navigator;
  const mockNavigatorShare = jest.fn();
  const mockNavigatorCanShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMessages.length = 0;

    // Setup navigator mock
    Object.defineProperty(global, 'navigator', {
      value: {
        share: mockNavigatorShare,
        canShare: mockNavigatorCanShare,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe('LINE Share flow with real FlexMessage building', () => {
    it('should build correct FlexMessage when sharing to LINE', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);
      mockedLiff.shareTargetPicker.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      // Verify shareTargetPicker was called with properly built FlexMessage
      expect(mockedLiff.shareTargetPicker).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'flex',
            altText: expect.stringMatching(/リバーシ対戦結果.*36.*28|28.*36/),
            contents: expect.objectContaining({
              type: 'bubble',
            }),
          }),
        ])
      );
    });

    it('should include OG image URL in FlexMessage', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);
      mockedLiff.shareTargetPicker.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      // Check the call arguments for hero image URL
      const callArgs = mockedLiff.shareTargetPicker.mock.calls[0][0][0] as {
        contents: { hero?: { url: string } };
      };
      const heroUrl = callArgs.contents.hero?.url;
      expect(heroUrl).toContain('/r/b/');
      expect(heroUrl).toContain('opengraph-image');
    });

    it('should verify FlexMessage structure matches LIFF spec', () => {
      const flexMessage = buildFlexMessage(mockResult, baseUrl);

      // Verify structure
      expect(flexMessage.type).toBe('flex');
      expect(flexMessage.altText).toBeDefined();
      expect(flexMessage.contents).toBeDefined();
      expect(flexMessage.contents.type).toBe('bubble');

      // Verify bubble has required sections
      expect(flexMessage.contents.hero).toBeDefined();
      expect(flexMessage.contents.body).toBeDefined();
      expect(flexMessage.contents.footer).toBeDefined();
    });
  });

  describe('Web Share flow integration', () => {
    it('should call navigator.share with correct URL structure', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      expect(mockNavigatorShare).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${baseUrl}/r/${mockResult.side}/${mockResult.encodedMoves}`,
          text: expect.any(String),
        })
      );
    });

    it('should include game result in share text', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      const shareCall = mockNavigatorShare.mock.calls[0][0];
      expect(shareCall.text).toContain('36');
      expect(shareCall.text).toContain('28');
    });
  });

  describe('Toast notification integration', () => {
    it('should show success toast with correct content after LINE share', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);
      mockedLiff.shareTargetPicker.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          timeout: 3000,
        })
      );
    });

    it('should show error toast when LINE share fails', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);
      mockedLiff.shareTargetPicker.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
        })
      );
    });

    it('should not show toast when user cancels share', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);
      const cancelError = new Error('User cancelled');
      (cancelError as Error & { code?: string }).code = 'cancel';
      mockedLiff.shareTargetPicker.mockRejectedValue(cancelError);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      expect(mockAddMessage).not.toHaveBeenCalled();
    });

    it('should show success toast after Web share', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
        })
      );
    });
  });

  describe('State management integration', () => {
    it('should properly track sharing state through complete flow', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);

      let resolveShare: () => void;
      const sharePromise = new Promise<void>((resolve) => {
        resolveShare = resolve;
      });
      mockedLiff.shareTargetPicker.mockReturnValue(sharePromise);

      const { result } = renderHook(() => useShare(baseUrl));

      // Initially not sharing
      expect(result.current.isSharing).toBe(false);

      // Start share
      act(() => {
        result.current.shareToLine(mockResult);
      });

      // Should be sharing
      expect(result.current.isSharing).toBe(true);

      // Complete share
      await act(async () => {
        resolveShare!();
        await sharePromise;
      });

      // Should no longer be sharing
      expect(result.current.isSharing).toBe(false);
    });

    it('should block concurrent shares across LINE and Web', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);
      mockNavigatorCanShare.mockReturnValue(true);

      let resolveLineShare: () => void;
      const lineSharePromise = new Promise<void>((resolve) => {
        resolveLineShare = resolve;
      });
      mockedLiff.shareTargetPicker.mockReturnValue(lineSharePromise);

      const { result } = renderHook(() => useShare(baseUrl));

      // Start LINE share
      act(() => {
        result.current.shareToLine(mockResult);
      });

      // Try to start Web share while LINE share is in progress
      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      // Web share should have been blocked
      expect(mockNavigatorShare).not.toHaveBeenCalled();

      // Cleanup
      await act(async () => {
        resolveLineShare!();
        await lineSharePromise;
      });
    });
  });

  describe('API availability integration', () => {
    it('should correctly detect LINE share availability', () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);

      const { result } = renderHook(() => useShare(baseUrl));

      expect(result.current.canShareLine).toBe(true);
    });

    it('should correctly detect Web Share availability', () => {
      mockNavigatorCanShare.mockReturnValue(true);

      const { result } = renderHook(() => useShare(baseUrl));

      expect(result.current.canShareWeb).toBe(true);
    });

    it('should return error status when LINE API is unavailable', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(false);

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToLine(mockResult);
      });

      // Should show error toast
      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
        })
      );
    });

    it('should return error status when Web Share API is unavailable', async () => {
      // Remove navigator.share
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToWeb(mockResult);
      });

      // Should show error toast
      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
        })
      );
    });
  });

  describe('Complete share flow with real data', () => {
    it('should complete full LINE share flow with actual result data', async () => {
      mockedLiff.isApiAvailable.mockReturnValue(true);
      mockedLiff.shareTargetPicker.mockResolvedValue(undefined);

      const realResult: ShareResult = {
        encodedMoves: 'MzQzMw', // d3, c3 encoded
        side: 'b',
        blackCount: 40,
        whiteCount: 24,
        winner: 'black',
      };

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToLine(realResult);
      });

      // Verify complete flow executed
      expect(mockedLiff.shareTargetPicker).toHaveBeenCalled();
      expect(mockAddMessage).toHaveBeenCalled();
      expect(result.current.isSharing).toBe(false);
    });

    it('should complete full Web Share flow with actual result data', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockResolvedValue(undefined);

      const realResult: ShareResult = {
        encodedMoves: 'MzQzMw',
        side: 'w',
        blackCount: 20,
        whiteCount: 44,
        winner: 'white',
      };

      const { result } = renderHook(() => useShare(baseUrl));

      await act(async () => {
        await result.current.shareToWeb(realResult);
      });

      // Verify complete flow executed
      expect(mockNavigatorShare).toHaveBeenCalled();
      expect(mockAddMessage).toHaveBeenCalled();
      expect(result.current.isSharing).toBe(false);

      // Verify URL contains correct side parameter
      const shareCall = mockNavigatorShare.mock.calls[0][0];
      expect(shareCall.url).toContain('/r/w/');
    });
  });
});
