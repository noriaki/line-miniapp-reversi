/**
 * WASM Error Handler Component
 * Displays user-friendly error messages for WASM-related failures
 */

'use client';

import React, { type JSX } from 'react';
import type { WASMLoadError, InitializationError } from '@/lib/ai/types';

interface WASMErrorHandlerProps {
  error: WASMLoadError | InitializationError;
}

/**
 * Get user-friendly error message based on error type and reason
 */
function getUserFriendlyMessage(error: WASMLoadError | InitializationError): {
  title: string;
  message: string;
  hint: string;
} {
  if (error.type === 'wasm_load_error') {
    switch (error.reason) {
      case 'fetch_failed':
        return {
          title: 'ゲームを読み込めませんでした',
          message: 'ゲームファイルの読み込みに失敗しました。',
          hint: 'インターネット接続を確認してください。',
        };
      case 'instantiation_failed':
        return {
          title: 'ゲームの初期化に失敗しました',
          message: 'ゲームエンジンの起動に失敗しました。',
          hint: 'ブラウザがWebAssemblyに対応していない可能性があります。',
        };
      case 'initialization_timeout':
        return {
          title: 'ゲームを読み込めませんでした',
          message: '読み込みに時間がかかっています。',
          hint: 'ページをリロードしてもう一度お試しください。',
        };
    }
  }

  // initialization_error
  switch (error.reason) {
    case 'wasm_load_failed':
      return {
        title: 'ゲームを読み込めませんでした',
        message: 'ゲームファイルの読み込みに失敗しました。',
        hint: 'ページをリロードしてください。',
      };
    case 'wasm_instantiation_failed':
      return {
        title: 'ゲームの初期化に失敗しました',
        message: 'ゲームエンジンの起動に失敗しました。',
        hint: 'ブラウザがWebAssemblyに対応していない可能性があります。',
      };
    case 'test_call_failed':
      return {
        title: 'ゲームの初期化に失敗しました',
        message: 'ゲームエンジンのテストに失敗しました。',
        hint: 'ページをリロードしてください。',
      };
  }
}

/**
 * WASM Error Handler Component
 * Displays error UI with reload button
 */
export default function WASMErrorHandler({
  error,
}: WASMErrorHandlerProps): JSX.Element {
  const { title, message, hint } = getUserFriendlyMessage(error);

  const handleReload = (): void => {
    window.location.reload();
  };

  return (
    <div
      className="wasm-error-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          maxWidth: '28rem',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow:
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{
                width: '2rem',
                height: '2rem',
                color: '#f59e0b',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#111827',
          }}
        >
          {title}
        </h2>

        {/* Error Message */}
        <p
          style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '0.5rem',
          }}
        >
          {message}
        </p>

        {/* Hint */}
        <p
          style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.875rem',
            marginBottom: '2rem',
          }}
        >
          {hint}
        </p>

        {/* Reload Button */}
        <button
          onClick={handleReload}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#06c755',
            color: 'white',
            borderRadius: '0.375rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = '#05b04b')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = '#06c755')
          }
        >
          リロード
        </button>

        {/* Technical Details (collapsed) */}
        <details
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            技術的な詳細
          </summary>
          <pre
            style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#4b5563',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
