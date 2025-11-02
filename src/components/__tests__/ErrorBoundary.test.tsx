/**
 * Error Boundary Tests
 * Test-Driven Development: Tests written BEFORE implementation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('RED: Error catching and display', () => {
    it('should catch errors and display error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should display error message
      expect(
        screen.getByText(/予期しないエラーが発生しました/)
      ).toBeInTheDocument();
    });

    it('should display retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /再試行/ });
      expect(retryButton).toBeInTheDocument();
    });

    it('should display reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /リロード/ });
      expect(reloadButton).toBeInTheDocument();
    });
  });

  describe('RED: Error logging', () => {
    it('should log error to console with ErrorLog format', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify console.error was called with formatted log
      // Find the call with [ErrorBoundary] prefix
      const errorBoundaryCall = consoleErrorSpy.mock.calls.find((call) => {
        const firstArg = call[0];
        return (
          typeof firstArg === 'string' && firstArg.includes('[ErrorBoundary]')
        );
      });

      expect(errorBoundaryCall).toBeDefined();
      expect(errorBoundaryCall![1]).toMatchObject({
        timestamp: expect.any(String),
        errorType: expect.any(String),
        errorCategory: 'system',
        message: 'Test error',
        stack: expect.any(String),
      });
    });
  });

  describe('RED: Retry functionality', () => {
    it('should reset error state when retry button is clicked', () => {
      // Use a controllable component
      let shouldThrow = true;
      const ControlledComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Normal content</div>;
      };

      render(
        <ErrorBoundary>
          <ControlledComponent />
        </ErrorBoundary>
      );

      // Error UI should be displayed
      expect(
        screen.getByText(/予期しないエラーが発生しました/)
      ).toBeInTheDocument();

      // Fix the error source
      shouldThrow = false;

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /再試行/ });
      fireEvent.click(retryButton);

      // Normal content should be displayed after retry
      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });

  describe('RED: Normal rendering without errors', () => {
    it('should render children normally when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });
});
