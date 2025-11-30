/**
 * ShareImageGenerator Tests
 *
 * TDD: RED phase - Tests written before implementation
 * Requirements: 4.1, 8.1
 *
 * Note: html2canvas is mocked since it will be installed in Task 9.
 * Tests focus on the generator logic rather than html2canvas internals.
 */

import type { ImageGenerationOptions } from '../types';

// Create mock for html2canvas before importing the module
const mockHtml2canvas = jest.fn();

// Use virtual mock for html2canvas since it's not installed yet
jest.mock(
  'html2canvas',
  () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockHtml2canvas(...args),
  }),
  { virtual: true }
);

// Import after mock setup
import {
  generateImageBlob,
  type ImageGenerationResult,
} from '../share-image-generator';

describe('ShareImageGenerator', () => {
  let mockElement: HTMLDivElement;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock DOM element
    mockElement = document.createElement('div');

    // Create mock canvas with toBlob method
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1200;
    mockCanvas.height = 630;

    // Mock canvas context
    const mockContext = {
      fillRect: jest.fn(),
      fillStyle: '',
    };
    jest
      .spyOn(mockCanvas, 'getContext')
      .mockReturnValue(mockContext as unknown as CanvasRenderingContext2D);

    // Default: html2canvas returns mock canvas
    mockHtml2canvas.mockResolvedValue(mockCanvas);
  });

  describe('generateImageBlob', () => {
    it('should generate a PNG blob from DOM element', async () => {
      // Mock toBlob to return a small blob
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
        callback(mockBlob);
      });

      const ref = { current: mockElement };
      const result = await generateImageBlob(ref);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Blob);
        expect(result.data.type).toBe('image/png');
      }
    });

    it('should call html2canvas with default scale of 2', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
        callback(mockBlob);
      });

      const ref = { current: mockElement };
      await generateImageBlob(ref);

      expect(mockHtml2canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({ scale: 2 })
      );
    });

    it('should support custom scale option', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
        callback(mockBlob);
      });

      const ref = { current: mockElement };
      const options: ImageGenerationOptions = { scale: 3 };
      await generateImageBlob(ref, options);

      expect(mockHtml2canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({ scale: 3 })
      );
    });

    it('should return error when ref.current is null', async () => {
      const ref = { current: null };
      const result = await generateImageBlob(ref);

      expect(result.success).toBe(false);
      if (!result.success && result.error.type === 'share_failed') {
        expect(result.error.message).toContain('element');
      }
    });

    it('should return error when html2canvas fails', async () => {
      mockHtml2canvas.mockRejectedValue(new Error('Canvas generation failed'));

      const ref = { current: mockElement };
      const result = await generateImageBlob(ref);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('share_failed');
      }
    });

    it('should return error when toBlob returns null', async () => {
      jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
        callback(null);
      });

      const ref = { current: mockElement };
      const result = await generateImageBlob(ref);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('share_failed');
      }
    });

    describe('maxSizeBytes option', () => {
      it('should return error when blob exceeds maxSizeBytes', async () => {
        // Create a blob larger than the limit
        const largeContent = new Array(2000000).fill('x').join(''); // ~2MB
        const largeBlob = new Blob([largeContent], { type: 'image/png' });

        jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
          callback(largeBlob);
        });

        const ref = { current: mockElement };
        const options: ImageGenerationOptions = { maxSizeBytes: 1048576 }; // 1MB limit
        const result = await generateImageBlob(ref, options);

        expect(result.success).toBe(false);
        if (!result.success && result.error.type === 'image_too_large') {
          expect(result.error.message).toContain('1048576');
        }
      });

      it('should succeed when blob is within maxSizeBytes', async () => {
        const smallBlob = new Blob(['small content'], { type: 'image/png' });

        jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
          callback(smallBlob);
        });

        const ref = { current: mockElement };
        const options: ImageGenerationOptions = { maxSizeBytes: 1048576 }; // 1MB limit
        const result = await generateImageBlob(ref, options);

        expect(result.success).toBe(true);
      });

      it('should use default maxSizeBytes of 1MB when not specified', async () => {
        // Create a blob larger than default 1MB
        const largeContent = new Array(2000000).fill('x').join('');
        const largeBlob = new Blob([largeContent], { type: 'image/png' });

        jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
          callback(largeBlob);
        });

        const ref = { current: mockElement };
        const result = await generateImageBlob(ref); // No options, use default

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('image_too_large');
        }
      });
    });

    describe('format options', () => {
      it('should default to PNG format', async () => {
        const mockBlob = new Blob(['test'], { type: 'image/png' });
        jest
          .spyOn(mockCanvas, 'toBlob')
          .mockImplementation((callback, type) => {
            expect(type).toBe('image/png');
            callback(mockBlob);
          });

        const ref = { current: mockElement };
        await generateImageBlob(ref);
      });

      it('should support JPEG format with quality option', async () => {
        const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
        jest
          .spyOn(mockCanvas, 'toBlob')
          .mockImplementation((callback, type, quality) => {
            expect(type).toBe('image/jpeg');
            expect(quality).toBe(0.85);
            callback(mockBlob);
          });

        const ref = { current: mockElement };
        const options: ImageGenerationOptions = {
          format: 'image/jpeg',
          quality: 0.85,
        };
        await generateImageBlob(ref, options);
      });
    });
  });

  describe('Result type structure', () => {
    it('should return ImageGenerationResult with success=true and data on success', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      jest.spyOn(mockCanvas, 'toBlob').mockImplementation((callback) => {
        callback(mockBlob);
      });

      const ref = { current: mockElement };
      const result: ImageGenerationResult = await generateImageBlob(ref);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result).not.toHaveProperty('error');
    });

    it('should return ImageGenerationResult with success=false and error on failure', async () => {
      const ref = { current: null };
      const result: ImageGenerationResult = await generateImageBlob(ref);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
      expect(result).not.toHaveProperty('data');
    });
  });
});
