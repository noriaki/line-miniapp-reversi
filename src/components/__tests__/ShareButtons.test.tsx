/**
 * ShareButtons Component Tests
 *
 * TDD: RED phase - Tests written before implementation
 * Requirements: 1.1, 1.3, 1.4, 1.5, 3.4
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButtons } from '../ShareButtons';

describe('ShareButtons', () => {
  const defaultProps = {
    isShareReady: true,
    onLineShare: jest.fn(),
    onWebShare: jest.fn(),
    canWebShare: true,
    isSharing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LINE Share Button', () => {
    it('should render LINE share button with correct text', () => {
      render(<ShareButtons {...defaultProps} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).toBeInTheDocument();
    });

    it('should use LINE brand color (#06C755)', () => {
      render(<ShareButtons {...defaultProps} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).toHaveStyle({ backgroundColor: '#06C755' });
    });

    it('should call onLineShare when clicked', () => {
      const onLineShare = jest.fn();
      render(<ShareButtons {...defaultProps} onLineShare={onLineShare} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      fireEvent.click(lineButton);

      expect(onLineShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('Web Share Button', () => {
    it('should render Web Share button when canWebShare is true', () => {
      render(<ShareButtons {...defaultProps} canWebShare={true} />);

      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });
      expect(webShareButton).toBeInTheDocument();
    });

    it('should NOT render Web Share button when canWebShare is false', () => {
      render(<ShareButtons {...defaultProps} canWebShare={false} />);

      const webShareButton = screen.queryByRole('button', {
        name: /その他でシェア/i,
      });
      expect(webShareButton).not.toBeInTheDocument();
    });

    it('should call onWebShare when clicked', () => {
      const onWebShare = jest.fn();
      render(<ShareButtons {...defaultProps} onWebShare={onWebShare} />);

      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });
      fireEvent.click(webShareButton);

      expect(onWebShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should disable buttons when isShareReady is false', () => {
      render(<ShareButtons {...defaultProps} isShareReady={false} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).toBeDisabled();

      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });
      expect(webShareButton).toBeDisabled();
    });

    it('should disable buttons when isSharing is true', () => {
      render(<ShareButtons {...defaultProps} isSharing={true} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).toBeDisabled();

      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });
      expect(webShareButton).toBeDisabled();
    });

    it('should enable buttons when isShareReady is true and isSharing is false', () => {
      render(
        <ShareButtons {...defaultProps} isShareReady={true} isSharing={false} />
      );

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).not.toBeDisabled();

      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });
      expect(webShareButton).not.toBeDisabled();
    });

    it('should not call handlers when buttons are disabled', () => {
      const onLineShare = jest.fn();
      const onWebShare = jest.fn();

      render(
        <ShareButtons
          {...defaultProps}
          isShareReady={false}
          onLineShare={onLineShare}
          onWebShare={onWebShare}
        />
      );

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });

      fireEvent.click(lineButton);
      fireEvent.click(webShareButton);

      expect(onLineShare).not.toHaveBeenCalled();
      expect(onWebShare).not.toHaveBeenCalled();
    });
  });

  describe('Touch Target Size', () => {
    it('should have minimum touch target size of 44x44px for LINE button', () => {
      render(<ShareButtons {...defaultProps} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).toHaveStyle({ minHeight: '44px' });
    });

    it('should have minimum touch target size of 44x44px for Web Share button', () => {
      render(<ShareButtons {...defaultProps} />);

      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });
      expect(webShareButton).toHaveStyle({ minHeight: '44px' });
    });
  });

  describe('Button Layout', () => {
    it('should render buttons in a flex container', () => {
      render(<ShareButtons {...defaultProps} />);

      const container = screen.getByTestId('share-buttons');
      expect(container).toHaveStyle({ display: 'flex' });
    });

    it('should have appropriate gap between buttons', () => {
      render(<ShareButtons {...defaultProps} />);

      const container = screen.getByTestId('share-buttons');
      expect(container).toHaveStyle({ gap: '0.5rem' });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<ShareButtons {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /LINEでシェア/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /その他でシェア/i })
      ).toBeInTheDocument();
    });

    it('should indicate loading state when isSharing is true', () => {
      render(<ShareButtons {...defaultProps} isSharing={true} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
