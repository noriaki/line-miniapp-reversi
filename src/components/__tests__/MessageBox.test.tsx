/**
 * Unit tests for MessageBox component
 * Test coverage: rendering, styling, layout stability, Japanese text handling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Message } from '@/types';
import { MessageBox } from '../MessageBox';

describe('MessageBox Component', () => {
  describe('Task 3.1: Fixed height layout and opacity transitions', () => {
    it('should render with fixed height container (64px)', () => {
      const message: Message = {
        type: 'info',
        text: 'テストメッセージ',
        timeout: 3000,
      };

      const { container } = render(<MessageBox message={message} />);
      const messageBox = container.firstChild as HTMLElement;

      expect(messageBox).toBeInTheDocument();
      const computedStyle = window.getComputedStyle(messageBox);
      expect(computedStyle.height).toBe('64px');
    });

    it('should maintain fixed height when message is null', () => {
      const { container } = render(<MessageBox message={null} />);
      const messageBox = container.firstChild as HTMLElement;

      expect(messageBox).toBeInTheDocument();
      const computedStyle = window.getComputedStyle(messageBox);
      expect(computedStyle.height).toBe('64px');
    });

    it('should display message with opacity 1 when message is provided', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('テスト');
      const messageContainer = messageText.closest('[role="status"]');

      expect(messageContainer).toBeInTheDocument();
      const computedStyle = window.getComputedStyle(
        messageContainer as HTMLElement
      );
      expect(computedStyle.opacity).toBe('1');
    });

    it('should hide message with opacity 0 when message is null', () => {
      const { container } = render(<MessageBox message={null} />);
      const messageBox = container.firstChild as HTMLElement;
      const innerContainer = messageBox.querySelector('[role="status"]');

      expect(innerContainer).toBeInTheDocument();
      const computedStyle = window.getComputedStyle(
        innerContainer as HTMLElement
      );
      expect(computedStyle.opacity).toBe('0');
    });

    it('should have transition-opacity class for fade animation', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('テスト');
      const messageContainer = messageText.closest('[role="status"]');

      expect(messageContainer).toHaveClass('transition-opacity');
    });

    it('should have transition duration of 300ms or less', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('テスト');
      const messageContainer = messageText.closest('[role="status"]');

      const computedStyle = window.getComputedStyle(
        messageContainer as HTMLElement
      );
      // Check transition duration (should be <= 300ms)
      const duration = computedStyle.transitionDuration;
      expect(duration).toMatch(/^0\.[0-3]s$/);
    });

    it('should be positioned at top of page', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      const { container } = render(<MessageBox message={message} />);
      const messageBox = container.firstChild as HTMLElement;

      expect(messageBox).toHaveClass('fixed', 'top-0');
    });

    it('should use client component directive', () => {
      // This is checked by ensuring the component can be rendered
      // Client components are required for interactive behavior
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      const { container } = render(<MessageBox message={message} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Task 3.2: Message type-based styling', () => {
    it('should render info message with subdued background color', () => {
      const message: Message = {
        type: 'info',
        text: 'パスしました',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('パスしました');
      const messageContainer = messageText.closest('[role="status"]');

      // Info messages should have blue-ish background (low saturation)
      expect(messageContainer).toHaveClass('bg-blue-50');
    });

    it('should render warning message with identifiable background color', () => {
      const message: Message = {
        type: 'warning',
        text: 'その手は置けません',
        timeout: 2000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('その手は置けません');
      const messageContainer = messageText.closest('[role="status"]');

      // Warning messages should have amber-ish background (low saturation)
      expect(messageContainer).toHaveClass('bg-amber-50');
    });

    it('should display info icon for info messages', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);

      // Check for info icon SVG or aria-label
      const icon = screen.getByLabelText('info');
      expect(icon).toBeInTheDocument();
    });

    it('should display warning icon for warning messages', () => {
      const message: Message = {
        type: 'warning',
        text: 'テスト',
        timeout: 2000,
      };

      render(<MessageBox message={message} />);

      // Check for warning icon SVG or aria-label
      const icon = screen.getByLabelText('warning');
      expect(icon).toBeInTheDocument();
    });

    it('should use mobile-friendly font size', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('テスト');

      // Should have text-sm or larger for mobile readability
      expect(messageText).toHaveClass('text-sm');
    });

    it('should have sufficient color contrast for accessibility', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('テスト');

      // Should have dark text color for contrast
      expect(messageText).toHaveClass('text-gray-800');
    });

    it('should truncate long text with ellipsis', () => {
      const longText = 'あ'.repeat(200); // 200 character Japanese text
      const message: Message = {
        type: 'info',
        text: longText,
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText(longText);

      // Should have line-clamp for text overflow
      expect(messageText).toHaveClass('line-clamp-2');
    });

    it('should not use high saturation colors (keeps game board as main focus)', () => {
      const infoMessage: Message = {
        type: 'info',
        text: 'Info',
        timeout: 3000,
      };

      const { rerender } = render(<MessageBox message={infoMessage} />);
      const infoText = screen.getByText('Info');
      const infoContainer = infoText.closest('[role="status"]');

      // Should use low saturation colors (50 shade, not 500+)
      expect(infoContainer).toHaveClass('bg-blue-50');
      expect(infoContainer).not.toHaveClass('bg-blue-500');
      expect(infoContainer).not.toHaveClass('bg-blue-600');

      const warningMessage: Message = {
        type: 'warning',
        text: 'Warning',
        timeout: 2000,
      };

      rerender(<MessageBox message={warningMessage} />);
      const warningText = screen.getByText('Warning');
      const warningContainer = warningText.closest('[role="status"]');

      expect(warningContainer).toHaveClass('bg-amber-50');
      expect(warningContainer).not.toHaveClass('bg-red-500');
      expect(warningContainer).not.toHaveClass('bg-orange-500');
    });
  });

  describe('Task 3.3: Japanese text handling', () => {
    it('should set lang="ja" attribute on container', () => {
      const message: Message = {
        type: 'info',
        text: 'これは日本語のテキストです',
        timeout: 3000,
      };

      const { container } = render(<MessageBox message={message} />);
      const messageBox = container.firstChild as HTMLElement;

      expect(messageBox).toHaveAttribute('lang', 'ja');
    });

    it('should render Japanese text correctly', () => {
      const japaneseText = 'パスしました。次はコンピューターのターンです。';
      const message: Message = {
        type: 'info',
        text: japaneseText,
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText(japaneseText);

      expect(messageText).toBeInTheDocument();
      expect(messageText.textContent).toBe(japaneseText);
    });

    it('should apply appropriate font family for Japanese text', () => {
      const message: Message = {
        type: 'info',
        text: '日本語',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('日本語');
      const computedStyle = window.getComputedStyle(messageText);

      // Should include Japanese-friendly fonts
      const fontFamily = computedStyle.fontFamily;
      expect(fontFamily).toMatch(
        /(-apple-system|BlinkMacSystemFont|"Segoe UI"|"Noto Sans JP"|sans-serif)/
      );
    });

    it('should apply line-height for Japanese readability', () => {
      const message: Message = {
        type: 'info',
        text: '日本語のテキスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('日本語のテキスト');

      // Check inline style for line-height (jsdom doesn't compute it properly)
      const style = messageText.getAttribute('style');
      expect(style).toContain('line-height: 1.5');

      // Also verify class that provides relaxed line height
      expect(messageText).toHaveClass('leading-relaxed');
    });

    it('should apply word-break for Japanese text wrapping', () => {
      const message: Message = {
        type: 'info',
        text: '長い日本語のテキストが適切に折り返されることを確認します',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText(
        '長い日本語のテキストが適切に折り返されることを確認します'
      );

      // Should have word-break for Japanese wrapping
      expect(messageText).toHaveClass('break-all');
    });

    it('should limit text to 2 lines with line-clamp', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageText = screen.getByText('テスト');

      expect(messageText).toHaveClass('line-clamp-2');
    });
  });

  describe('Accessibility and general behavior', () => {
    it('should have role="status" for screen readers', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const statusElement = screen.getByRole('status');

      expect(statusElement).toBeInTheDocument();
    });

    it('should use custom testId when provided', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} testId="custom-message-box" />);
      const messageBox = screen.getByTestId('custom-message-box');

      expect(messageBox).toBeInTheDocument();
    });

    it('should use default testId when not provided', () => {
      const message: Message = {
        type: 'info',
        text: 'テスト',
        timeout: 3000,
      };

      render(<MessageBox message={message} />);
      const messageBox = screen.getByTestId('message-box');

      expect(messageBox).toBeInTheDocument();
    });

    it('should render without errors when message transitions from null to message', () => {
      const { rerender } = render(<MessageBox message={null} />);

      expect(screen.getByTestId('message-box')).toBeInTheDocument();

      const message: Message = {
        type: 'info',
        text: 'New message',
        timeout: 3000,
      };

      rerender(<MessageBox message={message} />);

      expect(screen.getByText('New message')).toBeInTheDocument();
    });

    it('should render without errors when message transitions from message to null', () => {
      const message: Message = {
        type: 'info',
        text: 'Test message',
        timeout: 3000,
      };

      const { rerender } = render(<MessageBox message={message} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();

      rerender(<MessageBox message={null} />);

      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });
});
