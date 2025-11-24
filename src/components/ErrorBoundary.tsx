/**
 * Error Boundary Component
 * Catches unexpected errors and displays user-friendly error UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Error log format for monitoring
 */
interface ErrorLog {
  timestamp: string;
  errorType: string;
  errorCategory: 'user' | 'system' | 'business';
  message: string;
  stack?: string;
  gameState?: unknown;
  userAction?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console with ErrorLog format
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      errorType: error.name || 'UnexpectedError',
      errorCategory: 'system',
      message: error.message,
      stack: error.stack,
    };

    console.error('[ErrorBoundary]', errorLog);

    // Update state with error info
    this.setState({ errorInfo });
  }

  handleRetry = (): void => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    // Reload the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Error UI
      return (
        <div
          className="error-boundary-container"
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
                  backgroundColor: '#fee2e2',
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
                    color: '#dc2626',
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
              予期しないエラーが発生しました
            </h2>

            {/* Error Message */}
            <p
              style={{
                textAlign: 'center',
                color: '#6b7280',
                marginBottom: '2rem',
              }}
            >
              問題が解決しない場合は、ページをリロードしてください。
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexDirection: 'column',
              }}
            >
              <button
                onClick={this.handleRetry}
                style={{
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
                再試行
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                  borderRadius: '0.375rem',
                  fontWeight: '600',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = '#e5e7eb')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f3f4f6')
                }
              >
                リロード
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Normal rendering
    return this.props.children;
  }
}

export default ErrorBoundary;
