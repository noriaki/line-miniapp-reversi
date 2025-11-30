/**
 * ShareService Unit Tests
 *
 * Tests for the share service that coordinates image generation, upload,
 * and sharing via LINE and Web Share API.
 *
 * Requirements: 2.1, 2.4, 3.1, 3.2, 3.3, 4.1, 4.6
 */

import type { GameResult, ShareError } from '../types';
import type { ShareServiceResult } from '../share-service';
import liff from '@line/liff';

// Mock dependencies
const mockGenerateImageBlob = jest.fn();
const mockUploadImage = jest.fn();
const mockBuildShareFlexMessage = jest.fn();
const mockBuildShareText = jest.fn();

jest.mock('../share-image-generator', () => ({
  generateImageBlob: (...args: unknown[]) => mockGenerateImageBlob(...args),
}));

jest.mock('../image-uploader', () => ({
  uploadImage: (...args: unknown[]) => mockUploadImage(...args),
}));

jest.mock('../flex-message-builder', () => ({
  buildShareFlexMessage: (...args: unknown[]) =>
    mockBuildShareFlexMessage(...args),
}));

jest.mock('../share-text-builder', () => ({
  buildShareText: (...args: unknown[]) => mockBuildShareText(...args),
}));

// Mock liff module - use jest.spyOn for direct property mocking
jest.mock('@line/liff', () => ({
  __esModule: true,
  default: {
    isApiAvailable: jest.fn(),
    shareTargetPicker: jest.fn(),
  },
}));

// Create mock refs
const createMockRef = (element: HTMLDivElement | null) => ({
  current: element,
});

describe('ShareService', () => {
  // Import after mocks are set up
  let prepareShareImage: typeof import('../share-service').prepareShareImage;
  let shareViaLine: typeof import('../share-service').shareViaLine;
  let shareViaWebShare: typeof import('../share-service').shareViaWebShare;

  const mockGameResult: GameResult = {
    winner: 'black',
    blackCount: 36,
    whiteCount: 28,
  };

  const mockAppUrl = 'https://liff.line.me/test-liff-id';
  const mockImageUrl = 'https://r2.example.com/share-images/test.png';
  const mockBlob = new Blob(['test'], { type: 'image/png' });

  // Typed liff mock
  const mockLiff = liff as jest.Mocked<typeof liff>;

  beforeAll(async () => {
    // Import the module under test once
    const shareService = await import('../share-service');
    prepareShareImage = shareService.prepareShareImage;
    shareViaLine = shareService.shareViaLine;
    shareViaWebShare = shareService.shareViaWebShare;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockGenerateImageBlob.mockResolvedValue({
      success: true,
      data: mockBlob,
    });
    mockUploadImage.mockResolvedValue({
      success: true,
      data: mockImageUrl,
    });
    mockBuildShareFlexMessage.mockReturnValue({
      type: 'flex',
      altText: 'test',
      contents: {},
    });
    mockBuildShareText.mockReturnValue('Share text');
  });

  describe('prepareShareImage', () => {
    it('should generate and upload image successfully', async () => {
      const mockElement = document.createElement('div');
      const containerRef = createMockRef(mockElement);

      const result = await prepareShareImage(containerRef);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          imageUrl: mockImageUrl,
          imageBlob: mockBlob,
        });
      }
      expect(mockGenerateImageBlob).toHaveBeenCalledWith(containerRef);
      expect(mockUploadImage).toHaveBeenCalledWith(mockBlob);
    });

    it('should return error when image generation fails', async () => {
      const mockElement = document.createElement('div');
      const containerRef = createMockRef(mockElement);
      const generationError: ShareError = {
        type: 'share_failed',
        message: 'Generation failed',
      };

      mockGenerateImageBlob.mockResolvedValue({
        success: false,
        error: generationError,
      });

      const result = await prepareShareImage(containerRef);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(generationError);
      }
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should return error when image upload fails', async () => {
      const mockElement = document.createElement('div');
      const containerRef = createMockRef(mockElement);
      const uploadError: ShareError = {
        type: 'upload_failed',
        message: 'Upload failed',
      };

      mockUploadImage.mockResolvedValue({
        success: false,
        error: uploadError,
      });

      const result = await prepareShareImage(containerRef);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(uploadError);
      }
    });

    it('should return error when container ref is null', async () => {
      const containerRef = createMockRef(null);

      // Simulate generateImageBlob handling null ref
      mockGenerateImageBlob.mockResolvedValue({
        success: false,
        error: {
          type: 'share_failed',
          message: 'Share image element not found',
        },
      });

      const result = await prepareShareImage(containerRef);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('share_failed');
      }
    });
  });

  describe('shareViaLine', () => {
    it('should share via LINE successfully when API is available', async () => {
      (mockLiff.isApiAvailable as jest.Mock).mockReturnValue(true);
      (mockLiff.shareTargetPicker as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      const result = await shareViaLine(
        mockImageUrl,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(true);
      expect(mockLiff.isApiAvailable).toHaveBeenCalledWith('shareTargetPicker');
      expect(mockBuildShareFlexMessage).toHaveBeenCalledWith(
        mockImageUrl,
        mockGameResult,
        mockAppUrl
      );
      expect(mockLiff.shareTargetPicker).toHaveBeenCalled();
    });

    it('should return not_supported error when shareTargetPicker is not available', async () => {
      (mockLiff.isApiAvailable as jest.Mock).mockReturnValue(false);

      const result = await shareViaLine(
        mockImageUrl,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({ type: 'not_supported' });
      }
      expect(mockLiff.shareTargetPicker).not.toHaveBeenCalled();
    });

    it('should return cancelled error when user cancels share', async () => {
      (mockLiff.isApiAvailable as jest.Mock).mockReturnValue(true);
      // When user cancels, shareTargetPicker returns undefined or status is not 'success'
      (mockLiff.shareTargetPicker as jest.Mock).mockResolvedValue(undefined);

      const result = await shareViaLine(
        mockImageUrl,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({ type: 'cancelled' });
      }
    });

    it('should return share_failed error when shareTargetPicker throws', async () => {
      (mockLiff.isApiAvailable as jest.Mock).mockReturnValue(true);
      (mockLiff.shareTargetPicker as jest.Mock).mockRejectedValue(
        new Error('Share error')
      );

      const result = await shareViaLine(
        mockImageUrl,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('share_failed');
        if (result.error.type === 'share_failed') {
          expect(result.error.message).toContain('Share error');
        }
      }
    });
  });

  describe('shareViaWebShare', () => {
    const originalNavigator = global.navigator;

    beforeEach(() => {
      // Mock navigator.share and navigator.canShare
      Object.defineProperty(global, 'navigator', {
        value: {
          share: jest.fn().mockResolvedValue(undefined),
          canShare: jest.fn().mockReturnValue(true),
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

    it('should share via Web Share API successfully', async () => {
      const result = await shareViaWebShare(
        mockBlob,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(true);
      expect(navigator.canShare).toHaveBeenCalled();
      expect(navigator.share).toHaveBeenCalled();
      expect(mockBuildShareText).toHaveBeenCalledWith(
        mockGameResult,
        mockAppUrl
      );
    });

    it('should return not_supported error when navigator.share is not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      const result = await shareViaWebShare(
        mockBlob,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({ type: 'not_supported' });
      }
    });

    it('should return not_supported error when canShare returns false', async () => {
      (navigator.canShare as jest.Mock).mockReturnValue(false);

      const result = await shareViaWebShare(
        mockBlob,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({ type: 'not_supported' });
      }
    });

    it('should return cancelled error when user cancels share', async () => {
      const abortError = new Error('Share canceled');
      abortError.name = 'AbortError';
      (navigator.share as jest.Mock).mockRejectedValue(abortError);

      const result = await shareViaWebShare(
        mockBlob,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({ type: 'cancelled' });
      }
    });

    it('should return share_failed error when share throws non-abort error', async () => {
      (navigator.share as jest.Mock).mockRejectedValue(
        new Error('Share failed')
      );

      const result = await shareViaWebShare(
        mockBlob,
        mockGameResult,
        mockAppUrl
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('share_failed');
        if (result.error.type === 'share_failed') {
          expect(result.error.message).toContain('Share failed');
        }
      }
    });

    it('should create File with correct name and type from blob', async () => {
      const shareSpy = navigator.share as jest.Mock;

      await shareViaWebShare(mockBlob, mockGameResult, mockAppUrl);

      const shareData = shareSpy.mock.calls[0][0];
      expect(shareData.files).toHaveLength(1);
      expect(shareData.files[0].name).toBe('reversi-result.png');
      expect(shareData.files[0].type).toBe('image/png');
    });
  });
});

describe('ShareServiceResult type', () => {
  it('should correctly type success result', () => {
    const successResult: ShareServiceResult<string> = {
      success: true,
      data: 'test',
    };
    expect(successResult.success).toBe(true);
    expect(successResult.data).toBe('test');
  });

  it('should correctly type error result', () => {
    const errorResult: ShareServiceResult<string> = {
      success: false,
      error: { type: 'cancelled' },
    };
    expect(errorResult.success).toBe(false);
    expect(errorResult.error.type).toBe('cancelled');
  });
});
