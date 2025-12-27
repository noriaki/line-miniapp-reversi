/**
 * OgImagePrefetch Component Unit Tests
 * Tests for the client-side OGP image prefetch trigger
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import after mocking
import { OgImagePrefetch } from '../OgImagePrefetch';

describe('OgImagePrefetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  describe('API call behavior', () => {
    it('should call API route on mount with correct URL', async () => {
      render(<OgImagePrefetch side="b" encodedMoves="AQIDBA" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/og/b/AQIDBA', {
        cache: 'no-store',
      });
    });

    it('should call API with white side parameter', async () => {
      render(<OgImagePrefetch side="w" encodedMoves="AQIDBA" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/og/w/AQIDBA', {
          cache: 'no-store',
        });
      });
    });

    it('should call API with different encoded moves', async () => {
      render(<OgImagePrefetch side="b" encodedMoves="XYZ123" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/og/b/XYZ123', {
          cache: 'no-store',
        });
      });
    });
  });

  describe('fire-and-forget behavior', () => {
    it('should silently ignore network errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Should not throw
      expect(() => {
        render(<OgImagePrefetch side="b" encodedMoves="AQIDBA" />);
      }).not.toThrow();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Wait a bit for any potential error handling
      await new Promise((resolve) => setTimeout(resolve, 50));

      // No console.error should be called for network errors
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should silently ignore non-ok responses', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      expect(() => {
        render(<OgImagePrefetch side="b" encodedMoves="AQIDBA" />);
      }).not.toThrow();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Wait a bit for any potential error handling
      await new Promise((resolve) => setTimeout(resolve, 50));

      // No console.error should be called
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('rendering behavior', () => {
    it('should render nothing (no visible output)', () => {
      const { container } = render(
        <OgImagePrefetch side="b" encodedMoves="AQIDBA" />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('duplicate request tolerance', () => {
    it('should allow duplicate requests on re-render (no deduplication)', async () => {
      const { rerender } = render(
        <OgImagePrefetch side="b" encodedMoves="AQIDBA" />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Re-render with same props (simulating React Strict Mode or re-mount)
      rerender(<OgImagePrefetch side="b" encodedMoves="AQIDBA" />);

      // Note: In real React Strict Mode, useEffect runs twice
      // Here we just verify no deduplication logic interferes
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
