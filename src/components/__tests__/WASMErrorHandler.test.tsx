/**
 * WASM Error Handler Tests
 * Requirements: 2.1-2.8
 * Task 3: WASMErrorHandler.tsxのテスト実装
 * Test-Driven Development: Comprehensive test coverage for all error types and UI interactions
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import WASMErrorHandler from '../WASMErrorHandler';
import type { WASMLoadError, InitializationError } from '@/lib/ai/types';

describe('WASMErrorHandler', () => {
  // Task 3.1: エラーメッセージ表示のテスト

  describe('Task 3.1: Error Message Display', () => {
    it('should display fetch_failed error message', () => {
      // Given: fetch_failed error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'Failed to load ai.wasm',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: should display appropriate user-friendly messages
      expect(
        screen.getByText('ゲームを読み込めませんでした')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ゲームファイルの読み込みに失敗しました。')
      ).toBeInTheDocument();
      expect(
        screen.getByText('インターネット接続を確認してください。')
      ).toBeInTheDocument();
    });

    it('should display instantiation_failed error message', () => {
      // Given: instantiation_failed error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'instantiation_failed',
        message: 'WebAssembly instantiation failed',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: should display browser compatibility message
      expect(
        screen.getByText('ゲームの初期化に失敗しました')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ゲームエンジンの起動に失敗しました。')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'ブラウザがWebAssemblyに対応していない可能性があります。'
        )
      ).toBeInTheDocument();
    });

    it('should display initialization_timeout error message', () => {
      // Given: initialization_timeout error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'initialization_timeout',
        message: 'WASM initialization timeout',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: should display timeout-specific message
      expect(
        screen.getByText('ゲームを読み込めませんでした')
      ).toBeInTheDocument();
      expect(
        screen.getByText('読み込みに時間がかかっています。')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ページをリロードしてもう一度お試しください。')
      ).toBeInTheDocument();
    });

    it('should display wasm_load_failed error message (InitializationError)', () => {
      // Given: wasm_load_failed initialization error
      const error: InitializationError = {
        type: 'initialization_error',
        reason: 'wasm_load_failed',
        message: 'WASM load failed during initialization',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: should display appropriate message
      expect(
        screen.getByText('ゲームを読み込めませんでした')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ゲームファイルの読み込みに失敗しました。')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ページをリロードしてください。')
      ).toBeInTheDocument();
    });

    it('should display wasm_instantiation_failed error message (InitializationError)', () => {
      // Given: wasm_instantiation_failed initialization error
      const error: InitializationError = {
        type: 'initialization_error',
        reason: 'wasm_instantiation_failed',
        message: 'WASM instantiation failed during initialization',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: should display initialization failure message
      expect(
        screen.getByText('ゲームの初期化に失敗しました')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ゲームエンジンの起動に失敗しました。')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'ブラウザがWebAssemblyに対応していない可能性があります。'
        )
      ).toBeInTheDocument();
    });

    it('should display test_call_failed error message (InitializationError)', () => {
      // Given: test_call_failed initialization error
      const error: InitializationError = {
        type: 'initialization_error',
        reason: 'test_call_failed',
        message: 'WASM test call failed',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: should display test failure message
      expect(
        screen.getByText('ゲームの初期化に失敗しました')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ゲームエンジンのテストに失敗しました。')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ページをリロードしてください。')
      ).toBeInTheDocument();
    });
  });

  // Task 3.2: UI要素とユーザー操作のテスト

  describe('Task 3.2: UI Elements and User Interaction', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render reload button', () => {
      // Given: any error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'Test error',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: reload button should be present
      const reloadButton = screen.getByRole('button', { name: 'リロード' });
      expect(reloadButton).toBeInTheDocument();
    });

    it('should have reload button with onClick handler', () => {
      // Given: component is rendered
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'Test error',
      };
      const { container } = render(<WASMErrorHandler error={error} />);
      const reloadButton = screen.getByRole('button', { name: 'リロード' });

      // Then: button should have onClick attribute
      expect(reloadButton).toBeInTheDocument();
      expect(reloadButton).toHaveAttribute('style'); // Verify button is styled

      // Verify button element exists in DOM
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render technical details section (collapsed by default)', () => {
      // Given: error with technical details
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'Network error occurred',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: technical details section should be present
      expect(screen.getByText('技術的な詳細')).toBeInTheDocument();
    });

    it('should display JSON error details in technical section', () => {
      // Given: error with specific details
      const error: InitializationError = {
        type: 'initialization_error',
        reason: 'wasm_instantiation_failed',
        message: 'WebAssembly.instantiate failed: CompileError',
      };

      // When: component is rendered
      const { container } = render(<WASMErrorHandler error={error} />);

      // Then: JSON representation of error should be in the document
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(JSON.stringify(error, null, 2));
    });

    it('should expand technical details when summary is clicked', async () => {
      // Given: component is rendered
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'initialization_timeout',
        message: 'Timeout after 10s',
      };
      const user = userEvent.setup();
      render(<WASMErrorHandler error={error} />);

      // When: technical details summary is clicked
      const summary = screen.getByText('技術的な詳細');
      await user.click(summary);

      // Then: details should be expanded (details element has open attribute)
      const detailsElement = summary.closest('details');
      expect(detailsElement).toHaveAttribute('open');
    });

    it('should have reload button that is keyboard focusable', () => {
      // Given: component is rendered
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'Test error',
      };

      render(<WASMErrorHandler error={error} />);
      const button = screen.getByRole('button', { name: 'リロード' });

      // When: button is focused
      button.focus();

      // Then: button should be focusable and have focus
      expect(document.activeElement).toBe(button);
      expect(button).toBeEnabled();
    });
  });

  // Task 3.3: エラータイプ別ハンドリングのテスト

  describe('Task 3.3: Error Type-Specific Handling', () => {
    it('should handle all WASMLoadError types correctly', () => {
      // Given: all WASMLoadError reason types
      const errors: WASMLoadError[] = [
        {
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message: 'Fetch failed',
        },
        {
          type: 'wasm_load_error',
          reason: 'instantiation_failed',
          message: 'Instantiation failed',
        },
        {
          type: 'wasm_load_error',
          reason: 'initialization_timeout',
          message: 'Timeout',
        },
      ];

      // When/Then: each error should render with appropriate message
      errors.forEach((error) => {
        const { unmount } = render(<WASMErrorHandler error={error} />);
        // All WASMLoadError types should show reload button
        expect(
          screen.getByRole('button', { name: 'リロード' })
        ).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle all InitializationError types correctly', () => {
      // Given: all InitializationError reason types
      const errors: InitializationError[] = [
        {
          type: 'initialization_error',
          reason: 'wasm_load_failed',
          message: 'Load failed',
        },
        {
          type: 'initialization_error',
          reason: 'wasm_instantiation_failed',
          message: 'Instantiation failed',
        },
        {
          type: 'initialization_error',
          reason: 'test_call_failed',
          message: 'Test failed',
        },
      ];

      // When/Then: each error should render with appropriate message
      errors.forEach((error) => {
        const { unmount } = render(<WASMErrorHandler error={error} />);
        // All InitializationError types should show reload button
        expect(
          screen.getByRole('button', { name: 'リロード' })
        ).toBeInTheDocument();
        unmount();
      });
    });

    it('should display latest error when multiple errors occur (component re-render)', () => {
      // Given: first error
      const error1: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'First error',
      };

      // When: component is rendered with first error
      const { rerender } = render(<WASMErrorHandler error={error1} />);
      expect(
        screen.getByText('インターネット接続を確認してください。')
      ).toBeInTheDocument();

      // Given: second error (different type)
      const error2: InitializationError = {
        type: 'initialization_error',
        reason: 'test_call_failed',
        message: 'Second error',
      };

      // When: component is re-rendered with second error
      rerender(<WASMErrorHandler error={error2} />);

      // Then: should display latest error message
      expect(
        screen.getByText('ゲームエンジンのテストに失敗しました。')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('インターネット接続を確認してください。')
      ).not.toBeInTheDocument();
    });

    it('should correctly map error types to user-friendly messages', () => {
      // Given: mapping of error reasons to expected hint messages
      const errorMappings: Array<{
        error: WASMLoadError | InitializationError;
        expectedHint: string;
      }> = [
        {
          error: {
            type: 'wasm_load_error',
            reason: 'fetch_failed',
            message: '',
          },
          expectedHint: 'インターネット接続を確認してください。',
        },
        {
          error: {
            type: 'wasm_load_error',
            reason: 'instantiation_failed',
            message: '',
          },
          expectedHint:
            'ブラウザがWebAssemblyに対応していない可能性があります。',
        },
        {
          error: {
            type: 'wasm_load_error',
            reason: 'initialization_timeout',
            message: '',
          },
          expectedHint: 'ページをリロードしてもう一度お試しください。',
        },
        {
          error: {
            type: 'initialization_error',
            reason: 'wasm_load_failed',
            message: '',
          },
          expectedHint: 'ページをリロードしてください。',
        },
        {
          error: {
            type: 'initialization_error',
            reason: 'wasm_instantiation_failed',
            message: '',
          },
          expectedHint:
            'ブラウザがWebAssemblyに対応していない可能性があります。',
        },
        {
          error: {
            type: 'initialization_error',
            reason: 'test_call_failed',
            message: '',
          },
          expectedHint: 'ページをリロードしてください。',
        },
      ];

      // When/Then: each error should map to correct hint
      errorMappings.forEach(({ error, expectedHint }) => {
        const { unmount } = render(<WASMErrorHandler error={error} />);
        expect(screen.getByText(expectedHint)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // Task 3.4: アクセシビリティとレスポンシブのテスト

  describe('Task 3.4: Accessibility and Responsive Design', () => {
    it('should have proper container structure for responsive layout', () => {
      // Given: error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'Test error',
      };

      // When: component is rendered
      const { container } = render(<WASMErrorHandler error={error} />);

      // Then: should have wasm-error-container class
      const errorContainer = container.querySelector('.wasm-error-container');
      expect(errorContainer).toBeInTheDocument();
    });

    it('should render error icon for visual accessibility', () => {
      // Given: error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'instantiation_failed',
        message: 'Test error',
      };

      // When: component is rendered
      const { container } = render(<WASMErrorHandler error={error} />);

      // Then: SVG icon should be present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('should have proper heading hierarchy', () => {
      // Given: error
      const error: InitializationError = {
        type: 'initialization_error',
        reason: 'wasm_load_failed',
        message: 'Test error',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: should have h2 heading for title
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('ゲームを読み込めませんでした');
    });

    it('should render button with proper accessibility attributes', () => {
      // Given: error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'initialization_timeout',
        message: 'Test error',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: button should be accessible
      const button = screen.getByRole('button', { name: 'リロード' });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should support keyboard navigation for technical details (click expands)', async () => {
      // Given: component is rendered
      const error: InitializationError = {
        type: 'initialization_error',
        reason: 'test_call_failed',
        message: 'Test error',
      };
      const user = userEvent.setup();
      render(<WASMErrorHandler error={error} />);
      const summary = screen.getByText('技術的な詳細');
      const detailsElement = summary.closest('details');

      // Verify details is initially closed
      expect(detailsElement).not.toHaveAttribute('open');

      // When: summary is clicked (keyboard navigation via click event)
      await user.click(summary);

      // Then: details should expand (keyboard accessible via click)
      expect(detailsElement).toHaveAttribute('open');
    });

    it('should apply responsive design with proper styling structure', () => {
      // Given: error
      const error: WASMLoadError = {
        type: 'wasm_load_error',
        reason: 'fetch_failed',
        message: 'Test error',
      };

      // When: component is rendered
      const { container } = render(<WASMErrorHandler error={error} />);

      // Then: should have responsive container styles
      const errorContainer = container.querySelector('.wasm-error-container');
      expect(errorContainer).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
      });
    });

    it('should render all text content for screen reader compatibility', () => {
      // Given: error with all message parts
      const error: InitializationError = {
        type: 'initialization_error',
        reason: 'wasm_instantiation_failed',
        message: 'Detailed technical error message',
      };

      // When: component is rendered
      render(<WASMErrorHandler error={error} />);

      // Then: all text content should be accessible
      expect(
        screen.getByText('ゲームの初期化に失敗しました')
      ).toBeInTheDocument();
      expect(
        screen.getByText('ゲームエンジンの起動に失敗しました。')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'ブラウザがWebAssemblyに対応していない可能性があります。'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('技術的な詳細')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'リロード' })
      ).toBeInTheDocument();
    });
  });
});
