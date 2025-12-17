/**
 * Unit tests for Share Service
 * Tests LINE and Web Share API integration
 */

import {
  canShareToLine,
  canShareToWeb,
  shareToLine,
  shareToWeb,
} from '../share-service';
import type { ShareResult } from '../flex-message-builder';
import liff from '@line/liff';

// Mock liff module
jest.mock('@line/liff', () => ({
  isApiAvailable: jest.fn(),
  shareTargetPicker: jest.fn(),
}));

// Mock navigator.share
const mockNavigatorShare = jest.fn();
const mockNavigatorCanShare = jest.fn();

describe('ShareService', () => {
  // Test URLs
  const liffId = 'test-liff-id';
  const baseUrl = 'https://example.com';
  const mockResult: ShareResult = {
    encodedMoves: 'ABC123',
    side: 'b',
    blackCount: 36,
    whiteCount: 28,
    winner: 'black',
  };

  // Build test URLs based on mock result
  const permalinkUrl = `https://miniapp.line.me/${liffId}/r/${mockResult.side}/${mockResult.encodedMoves}`;
  const ogImageUrl = `${baseUrl}/r/${mockResult.side}/${mockResult.encodedMoves}/opengraph-image`;
  const homeUrl = `https://miniapp.line.me/${liffId}`;
  const shareUrl = permalinkUrl; // Web Share also uses permalink

  beforeEach(() => {
    jest.clearAllMocks();

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
    // Reset navigator
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  describe('canShareToLine', () => {
    it('should return true when shareTargetPicker is available', () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(true);

      expect(canShareToLine()).toBe(true);
      expect(liff.isApiAvailable).toHaveBeenCalledWith('shareTargetPicker');
    });

    it('should return false when shareTargetPicker is not available', () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(false);

      expect(canShareToLine()).toBe(false);
    });

    it('should return false when isApiAvailable throws', () => {
      (liff.isApiAvailable as jest.Mock).mockImplementation(() => {
        throw new Error('LIFF not initialized');
      });

      expect(canShareToLine()).toBe(false);
    });
  });

  describe('canShareToWeb', () => {
    it('should return true when navigator.share is available', () => {
      mockNavigatorCanShare.mockReturnValue(true);

      expect(canShareToWeb()).toBe(true);
    });

    it('should return false when navigator.share is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(canShareToWeb()).toBe(false);
    });

    it('should return false when canShare returns false', () => {
      mockNavigatorCanShare.mockReturnValue(false);

      expect(canShareToWeb()).toBe(false);
    });
  });

  describe('shareToLine', () => {
    it('should return success when share completes', async () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(true);
      (liff.shareTargetPicker as jest.Mock).mockResolvedValue(undefined);

      const result = await shareToLine(
        mockResult,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

      expect(result.status).toBe('success');
      expect(liff.shareTargetPicker).toHaveBeenCalled();
    });

    it('should return cancelled when user cancels the share', async () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(true);
      // When user cancels, shareTargetPicker resolves but with specific behavior
      // In LIFF, cancellation typically throws or returns specific value
      // Let's mock it as returning undefined (success case) vs throwing for cancel
      const cancelError = new Error('cancelled');
      (cancelError as Error & { code?: string }).code = 'cancel';
      (liff.shareTargetPicker as jest.Mock).mockRejectedValue(cancelError);

      const result = await shareToLine(
        mockResult,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

      expect(result.status).toBe('cancelled');
    });

    it('should return error when shareTargetPicker throws', async () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(true);
      (liff.shareTargetPicker as jest.Mock).mockRejectedValue(
        new Error('Share failed')
      );

      const result = await shareToLine(
        mockResult,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toBeDefined();
      }
    });

    it('should return error when API is not available', async () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(false);

      const result = await shareToLine(
        mockResult,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toContain('available');
      }
    });

    it('should build and send flex message with correct parameters', async () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(true);
      (liff.shareTargetPicker as jest.Mock).mockResolvedValue(undefined);

      await shareToLine(mockResult, permalinkUrl, ogImageUrl, homeUrl);

      expect(liff.shareTargetPicker).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'flex',
            altText: expect.any(String),
            contents: expect.any(Object),
          }),
        ])
      );
    });

    it('should pass homeUrl to buildFlexMessage for footer navigation', async () => {
      (liff.isApiAvailable as jest.Mock).mockReturnValue(true);
      (liff.shareTargetPicker as jest.Mock).mockResolvedValue(undefined);

      await shareToLine(mockResult, permalinkUrl, ogImageUrl, homeUrl);

      // Verify that the flex message contains home URL for footer navigation
      const flexMessageCall = (liff.shareTargetPicker as jest.Mock).mock
        .calls[0][0][0];
      const footerStr = JSON.stringify(flexMessageCall.contents.footer);
      expect(footerStr).toContain(homeUrl);
    });
  });

  describe('shareToWeb', () => {
    it('should return success when share completes', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockResolvedValue(undefined);

      const result = await shareToWeb(mockResult, shareUrl);

      expect(result.status).toBe('success');
      expect(mockNavigatorShare).toHaveBeenCalled();
    });

    it('should return cancelled when user aborts', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      const abortError = new Error('Share aborted');
      abortError.name = 'AbortError';
      mockNavigatorShare.mockRejectedValue(abortError);

      const result = await shareToWeb(mockResult, shareUrl);

      expect(result.status).toBe('cancelled');
    });

    it('should return error when share fails', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockRejectedValue(new Error('Share failed'));

      const result = await shareToWeb(mockResult, shareUrl);

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toBeDefined();
      }
    });

    it('should return error when Web Share API is not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      const result = await shareToWeb(mockResult, shareUrl);

      expect(result.status).toBe('error');
    });

    it('should call navigator.share with permalink URL and text', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockResolvedValue(undefined);

      await shareToWeb(mockResult, shareUrl);

      expect(mockNavigatorShare).toHaveBeenCalledWith(
        expect.objectContaining({
          // Should use permalink URL (miniapp.line.me)
          url: expect.stringContaining('miniapp.line.me'),
          text: expect.any(String),
        })
      );

      // Should not include files
      const shareCallArg = mockNavigatorShare.mock.calls[0][0];
      expect(shareCallArg.files).toBeUndefined();
    });

    it('should include score in share text', async () => {
      mockNavigatorCanShare.mockReturnValue(true);
      mockNavigatorShare.mockResolvedValue(undefined);

      await shareToWeb(mockResult, shareUrl);

      const shareCallArg = mockNavigatorShare.mock.calls[0][0];
      expect(shareCallArg.text).toMatch(/36.*28|28.*36/);
    });
  });
});
