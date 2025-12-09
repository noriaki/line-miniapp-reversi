import React from 'react';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationFallback } from '../NavigationFallback';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('NavigationFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should not show button initially', () => {
      render(<NavigationFallback targetUrl="/r/b/test123" />);

      const button = screen.queryByRole('button', { name: /結果を確認する/i });
      expect(button).not.toBeInTheDocument();
    });

    it('should render container element', () => {
      const { container } = render(
        <NavigationFallback targetUrl="/r/b/test123" />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Timeout Behavior', () => {
    it('should show button after default 2000ms timeout', async () => {
      render(<NavigationFallback targetUrl="/r/b/test123" />);

      // Button should not be visible initially
      expect(
        screen.queryByRole('button', { name: /結果を確認する/i })
      ).not.toBeInTheDocument();

      // Advance timers by 2000ms
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Button should now be visible
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /結果を確認する/i })
        ).toBeInTheDocument();
      });
    });

    it('should show button after custom timeout', async () => {
      render(<NavigationFallback targetUrl="/r/b/test123" timeoutMs={1000} />);

      // Advance timers by 999ms - button should not be visible
      act(() => {
        jest.advanceTimersByTime(999);
      });

      expect(
        screen.queryByRole('button', { name: /結果を確認する/i })
      ).not.toBeInTheDocument();

      // Advance by 1 more ms
      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /結果を確認する/i })
        ).toBeInTheDocument();
      });
    });

    it('should not show button before timeout expires', () => {
      render(<NavigationFallback targetUrl="/r/b/test123" />);

      // Advance timers by 1999ms
      act(() => {
        jest.advanceTimersByTime(1999);
      });

      expect(
        screen.queryByRole('button', { name: /結果を確認する/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to target URL when button is clicked', async () => {
      const targetUrl = '/r/b/ABC123';
      render(<NavigationFallback targetUrl={targetUrl} />);

      // Wait for button to appear
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const button = await screen.findByRole('button', {
        name: /結果を確認する/i,
      });
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith(targetUrl);
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('should work with different target URLs', async () => {
      const targetUrl = '/r/w/XYZ789';
      render(<NavigationFallback targetUrl={targetUrl} />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const button = await screen.findByRole('button', {
        name: /結果を確認する/i,
      });
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith(targetUrl);
    });
  });

  describe('Button Styling', () => {
    it('should have appropriate button text', async () => {
      render(<NavigationFallback targetUrl="/r/b/test" />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const button = await screen.findByRole('button');
      expect(button).toHaveTextContent('結果を確認する');
    });

    it('should have data-testid attribute', async () => {
      render(<NavigationFallback targetUrl="/r/b/test" />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const button = await screen.findByTestId('navigation-fallback-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should clear timer on unmount', () => {
      const { unmount } = render(
        <NavigationFallback targetUrl="/r/b/test123" />
      );

      // Unmount before timeout
      unmount();

      // Advance timers - should not cause errors
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // No assertion needed - test passes if no error is thrown
    });
  });
});
