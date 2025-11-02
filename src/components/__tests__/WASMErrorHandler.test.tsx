/**
 * WASM Error Handler Tests
 * Task 7.2: WASM関連のエラーハンドリング
 * Test-Driven Development: Tests written BEFORE implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WASMErrorHandler from '../WASMErrorHandler';

describe('WASMErrorHandler', () => {
  describe('RED: WASM load failure display', () => {
    it('should display error message when WASM fails to load', () => {
      const error = {
        type: 'wasm_load_error' as const,
        reason: 'fetch_failed' as const,
        message: 'Failed to load ai.wasm',
      };

      render(<WASMErrorHandler error={error} />);

      expect(
        screen.getByText(/ゲームを読み込めませんでした/)
      ).toBeInTheDocument();
    });

    it('should display reload button for WASM load error', () => {
      const error = {
        type: 'wasm_load_error' as const,
        reason: 'fetch_failed' as const,
        message: 'Failed to load ai.wasm',
      };

      render(<WASMErrorHandler error={error} />);

      const reloadButton = screen.getByRole('button', { name: /リロード/ });
      expect(reloadButton).toBeInTheDocument();
    });
  });

  describe('RED: WASM initialization failure display', () => {
    it('should display initialization error message', () => {
      const error = {
        type: 'initialization_error' as const,
        reason: 'wasm_instantiation_failed' as const,
        message: 'WASM instantiation failed',
      };

      render(<WASMErrorHandler error={error} />);

      expect(
        screen.getByText(/ゲームの初期化に失敗しました/)
      ).toBeInTheDocument();
    });

    it('should display browser compatibility message', () => {
      const error = {
        type: 'initialization_error' as const,
        reason: 'wasm_instantiation_failed' as const,
        message: 'WASM instantiation failed',
      };

      render(<WASMErrorHandler error={error} />);

      expect(
        screen.getByText(
          /ブラウザがWebAssemblyに対応していない可能性があります/
        )
      ).toBeInTheDocument();
    });
  });

  describe('RED: User-friendly error messages', () => {
    it('should display user-friendly message for fetch failure', () => {
      const error = {
        type: 'wasm_load_error' as const,
        reason: 'fetch_failed' as const,
        message: 'Network error',
      };

      render(<WASMErrorHandler error={error} />);

      expect(
        screen.getByText(/インターネット接続を確認してください/)
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for initialization timeout', () => {
      const error = {
        type: 'wasm_load_error' as const,
        reason: 'initialization_timeout' as const,
        message: 'Timeout',
      };

      render(<WASMErrorHandler error={error} />);

      expect(
        screen.getByText(/読み込みに時間がかかっています/)
      ).toBeInTheDocument();
    });
  });
});
