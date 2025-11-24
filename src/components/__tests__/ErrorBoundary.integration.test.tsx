/**
 * Integration Tests - Error Boundary Integration
 *
 * Tests error handling UI display when errors occur
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// テスト用のエラーを投げるコンポーネント
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <div>正常なコンテンツ</div>;
};

describe('Integration Test: Error Boundary', () => {
  // コンソールエラーを一時的に抑制
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should catch and display error when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // エラーメッセージが表示される
    expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
  });

  it('should display normal content when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // 正常なコンテンツが表示される
    expect(screen.getByText('正常なコンテンツ')).toBeInTheDocument();
  });

  it('should show retry button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // リトライボタンが表示される
    const retryButton = screen.queryByText(/再試行|リトライ|もう一度/);
    expect(retryButton).toBeInTheDocument();
  });

  it('should show reload button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // リロードボタンが表示される（複数ある場合もある）
    const reloadButtons = screen.queryAllByText(/リロード|再読み込み/);
    expect(reloadButtons.length).toBeGreaterThan(0);
  });

  it('should log error to console when error is caught', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // エラーがコンソールにログされる
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle nested error boundaries', () => {
    render(
      <ErrorBoundary>
        <div>外側のコンテンツ</div>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // 内側のError Boundaryがエラーをキャッチ
    expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
    // 外側のコンテンツは表示される
    expect(screen.getByText('外側のコンテンツ')).toBeInTheDocument();
  });

  it('should provide user-friendly error message without technical details', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // ユーザフレンドリーなメッセージが表示される
    const errorMessage = screen.getByText(/エラーが発生しました/);
    expect(errorMessage).toBeInTheDocument();

    // スタックトレースなどの技術的詳細は表示されない（本番環境）
    const stackTrace = screen.queryByText(/at ThrowError/);
    expect(stackTrace).not.toBeInTheDocument();
  });
});
