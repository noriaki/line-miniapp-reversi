/**
 * Unit tests for ShareButtons component
 * Tests LINE and Web Share button rendering and interaction
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButtons } from '../ShareButtons';
import type { ShareResult } from '@/lib/share/flex-message-builder';
import { useShare } from '@/hooks/useShare';

// Mock useShare hook
jest.mock('@/hooks/useShare');

const mockUseShare = useShare as jest.MockedFunction<typeof useShare>;

describe('ShareButtons', () => {
  const mockResult: ShareResult = {
    encodedMoves: 'ABC123',
    side: 'b',
    blackCount: 36,
    whiteCount: 28,
    winner: 'black',
  };

  const baseUrl = 'https://example.com';
  const liffId = 'test-liff-id';

  const mockShareToLine = jest.fn();
  const mockShareToWeb = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShare.mockReturnValue({
      isSharing: false,
      canShareLine: true,
      canShareWeb: true,
      shareToLine: mockShareToLine,
      shareToWeb: mockShareToWeb,
      messageQueue: {
        currentMessage: null,
        addMessage: jest.fn(),
        clearMessage: jest.fn(),
      },
    });
  });

  describe('rendering', () => {
    it('should render LINE share button', () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const lineButton = screen.getByRole('button', { name: /LINE/i });
      expect(lineButton).toBeInTheDocument();
    });

    it('should render Web Share button when available', () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const webButton = screen.getByRole('button', { name: /その他/i });
      expect(webButton).toBeInTheDocument();
    });

    it('should not render Web Share button when not available', () => {
      mockUseShare.mockReturnValue({
        isSharing: false,
        canShareLine: true,
        canShareWeb: false,
        shareToLine: mockShareToLine,
        shareToWeb: mockShareToWeb,
        messageQueue: {
          currentMessage: null,
          addMessage: jest.fn(),
          clearMessage: jest.fn(),
        },
      });

      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const webButton = screen.queryByRole('button', { name: /その他/i });
      expect(webButton).not.toBeInTheDocument();
    });

    it('should apply LINE green color to LINE button', () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const lineButton = screen.getByRole('button', { name: /LINE/i });
      // Check for LINE green color (#06C755) in styles
      expect(lineButton).toHaveStyle({ backgroundColor: '#06C755' });
    });
  });

  describe('interactions', () => {
    it('should call shareToLine when LINE button is clicked', async () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const lineButton = screen.getByRole('button', { name: /LINE/i });
      fireEvent.click(lineButton);

      expect(mockShareToLine).toHaveBeenCalledWith(mockResult);
    });

    it('should call shareToWeb when Web Share button is clicked', async () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const webButton = screen.getByRole('button', { name: /その他/i });
      fireEvent.click(webButton);

      expect(mockShareToWeb).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('disabled state', () => {
    it('should disable LINE button while sharing', () => {
      mockUseShare.mockReturnValue({
        isSharing: true,
        canShareLine: true,
        canShareWeb: true,
        shareToLine: mockShareToLine,
        shareToWeb: mockShareToWeb,
        messageQueue: {
          currentMessage: null,
          addMessage: jest.fn(),
          clearMessage: jest.fn(),
        },
      });

      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const lineButton = screen.getByRole('button', { name: /LINE/i });
      expect(lineButton).toBeDisabled();
    });

    it('should disable Web Share button while sharing', () => {
      mockUseShare.mockReturnValue({
        isSharing: true,
        canShareLine: true,
        canShareWeb: true,
        shareToLine: mockShareToLine,
        shareToWeb: mockShareToWeb,
        messageQueue: {
          currentMessage: null,
          addMessage: jest.fn(),
          clearMessage: jest.fn(),
        },
      });

      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const webButton = screen.getByRole('button', { name: /その他/i });
      expect(webButton).toBeDisabled();
    });

    it('should not call share functions when buttons are disabled', () => {
      mockUseShare.mockReturnValue({
        isSharing: true,
        canShareLine: true,
        canShareWeb: true,
        shareToLine: mockShareToLine,
        shareToWeb: mockShareToWeb,
        messageQueue: {
          currentMessage: null,
          addMessage: jest.fn(),
          clearMessage: jest.fn(),
        },
      });

      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      const lineButton = screen.getByRole('button', { name: /LINE/i });
      const webButton = screen.getByRole('button', { name: /その他/i });

      fireEvent.click(lineButton);
      fireEvent.click(webButton);

      expect(mockShareToLine).not.toHaveBeenCalled();
      expect(mockShareToWeb).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have accessible names for buttons', () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      expect(
        screen.getByRole('button', { name: /LINE.*シェア/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /その他.*シェア/i })
      ).toBeInTheDocument();
    });
  });

  describe('data-testid', () => {
    it('should have data-testid for LINE button', () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      expect(screen.getByTestId('share-line-button')).toBeInTheDocument();
    });

    it('should have data-testid for Web Share button when visible', () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      expect(screen.getByTestId('share-web-button')).toBeInTheDocument();
    });
  });

  describe('ogImageUrl prop', () => {
    it('should pass ogImageUrl to useShare when provided', () => {
      const ogImageUrl = 'https://images.reversi.line-mini.dev/og/b/ABC123.png';

      render(
        <ShareButtons
          result={mockResult}
          baseUrl={baseUrl}
          liffId={liffId}
          ogImageUrl={ogImageUrl}
        />
      );

      // Verify useShare was called with ogImageUrl
      expect(mockUseShare).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl,
          liffId,
          ogImageUrl,
        })
      );
    });

    it('should call useShare without ogImageUrl when not provided', () => {
      render(
        <ShareButtons result={mockResult} baseUrl={baseUrl} liffId={liffId} />
      );

      // Verify useShare was called without ogImageUrl (undefined)
      expect(mockUseShare).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl,
          liffId,
        })
      );
      // Ensure ogImageUrl is not passed or is undefined
      const callArgs = mockUseShare.mock.calls[0][0];
      expect(callArgs.ogImageUrl).toBeUndefined();
    });
  });
});
