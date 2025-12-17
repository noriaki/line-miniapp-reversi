/**
 * GameBoard LIFF Integration Tests
 *
 * Tests for LINE profile icon display and LIFF feature integration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock move-encoder
jest.mock('@/lib/share/move-encoder', () => ({
  encodeMoves: jest.fn().mockReturnValue('testEncodedMoves'),
}));

// Mock useLiff hook
let mockLiffState: any = {
  isReady: false,
  error: null,
  isInClient: null,
  isLoggedIn: null,
  profile: null,
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => mockLiffState,
}));

// Mock useAIPlayer to avoid import.meta issues
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
  }),
}));

describe('GameBoard - LIFF Integration', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockLiffState = {
      isReady: false,
      error: null,
      isInClient: null,
      isLoggedIn: null,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };
  });

  describe('Profile Icon Display', () => {
    it('should display LINE profile icon when profile is available', () => {
      // Mock LIFF with profile
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
          pictureUrl: 'https://example.com/profile.jpg',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display profile icon
      const profileIcon = screen.getByTestId('profile-icon');
      expect(profileIcon).toBeInTheDocument();
      expect(profileIcon).toHaveAttribute(
        'src',
        'https://example.com/profile.jpg'
      );
      expect(profileIcon).toHaveAttribute('alt', 'Test User');
    });

    it('should display default icon when profile is not available', () => {
      // Mock LIFF without profile
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should display default icon when pictureUrl is missing', () => {
      // Mock LIFF with profile but no pictureUrl
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
          // No pictureUrl
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should display default icon during LIFF initialization', () => {
      // Mock LIFF not ready
      mockLiffState = {
        isReady: false,
        error: null,
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon while initializing
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should display default icon when LIFF has error', () => {
      // Mock LIFF with error
      mockLiffState = {
        isReady: true,
        error: 'LIFF initialization failed',
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon on error
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should render profile icon in circular shape', () => {
      // Mock LIFF with profile
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
          pictureUrl: 'https://example.com/profile.jpg',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const profileIcon = screen.getByTestId('profile-icon');
      // Check for circular styling (rounded-full class)
      expect(profileIcon).toHaveClass('rounded-full');
    });
  });

  describe('External Browser Login UI', () => {
    it('should display login button when in external browser and not logged in', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false, // External browser
        isLoggedIn: false, // Not logged in
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.getByTestId('liff-login-button');
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveTextContent(/LINE.*ログイン/i);
    });

    it('should NOT display login button when in LINE app', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true, // Inside LINE app
        isLoggedIn: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.queryByTestId('liff-login-button');
      expect(loginButton).not.toBeInTheDocument();
    });

    it('should NOT display login button when already logged in', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: true, // Already logged in
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.queryByTestId('liff-login-button');
      expect(loginButton).not.toBeInTheDocument();
    });

    it('should NOT display login button during LIFF initialization', () => {
      mockLiffState = {
        isReady: false, // Not ready
        error: null,
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.queryByTestId('liff-login-button');
      expect(loginButton).not.toBeInTheDocument();
    });

    it('should call login function when login button is clicked', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: false,
        profile: null,
        login: mockLogin,
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.getByTestId('liff-login-button');
      await user.click(loginButton);

      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Login State UI Updates', () => {
    it('should display profile icon when logged in (displayName removed per optimization)', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'テストユーザー',
          pictureUrl: 'https://example.com/profile.jpg',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Profile icon should be displayed but displayName should NOT be displayed
      expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
      expect(screen.queryByText(/テストユーザー/)).not.toBeInTheDocument();
    });

    it('should NOT display profile name when not logged in', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Profile name should not exist
      expect(screen.queryByText(/テストユーザー/)).not.toBeInTheDocument();
    });

    it('should show default UI during LIFF initialization', () => {
      mockLiffState = {
        isReady: false, // Still initializing
        error: null,
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should show default icon
      expect(screen.getByTestId('default-profile-icon')).toBeInTheDocument();
      // Should NOT show login button
      expect(screen.queryByTestId('liff-login-button')).not.toBeInTheDocument();
    });
  });

  describe('Score UI Optimization Tests', () => {
    describe('displayName should NOT be displayed', () => {
      it('should NOT display displayName text even when profile has displayName', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: true,
          isLoggedIn: true,
          profile: {
            userId: 'U1234567890',
            displayName: 'Test User Display Name',
            pictureUrl: 'https://example.com/profile.jpg',
          },
          login: jest.fn(),
          logout: jest.fn(),
        };

        render(<GameBoard />);

        // displayName text should NOT be in the document
        expect(
          screen.queryByText('Test User Display Name')
        ).not.toBeInTheDocument();
      });

      it('should NOT display displayName in LIFF environment', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: true,
          isLoggedIn: true,
          profile: {
            userId: 'U1234567890',
            displayName: 'テストユーザー',
            pictureUrl: 'https://example.com/profile.jpg',
          },
          login: jest.fn(),
          logout: jest.fn(),
        };

        render(<GameBoard />);

        expect(screen.queryByText('テストユーザー')).not.toBeInTheDocument();
      });

      it('should NOT display displayName in non-LIFF environment', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: false,
          isLoggedIn: false,
          profile: null,
          login: jest.fn(),
          logout: jest.fn(),
        };

        render(<GameBoard />);

        // No profile name should be visible
        const stoneCountSection = screen.getByText(/vs/i).parentElement;
        expect(stoneCountSection).toBeInTheDocument();
        // Should not contain any displayName text
        expect(stoneCountSection?.textContent).not.toMatch(/User/);
      });
    });

    describe(' Score element order', () => {
      it('should display score elements in correct order: black icon → black count → vs → white count → white icon', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: true,
          isLoggedIn: true,
          profile: {
            userId: 'U1234567890',
            displayName: 'Test User',
            pictureUrl: 'https://example.com/profile.jpg',
          },
          login: jest.fn(),
          logout: jest.fn(),
        };

        const { container } = render(<GameBoard />);
        const stoneCount = container.querySelector('.stone-count');

        expect(stoneCount).toBeInTheDocument();

        // Get all children in order
        const children = Array.from(stoneCount?.children || []);

        // Should have 3 main sections: black section, divider, white section
        expect(children.length).toBe(3);

        // First child: black player section
        expect(children[0]).toHaveClass('stone-count-item');

        // Second child: vs divider
        expect(children[1]).toHaveClass('stone-count-divider');
        expect(children[1].textContent).toBe('vs');

        // Third child: white player section
        expect(children[2]).toHaveClass('stone-count-item');
      });

      it('should display black icon on the left side of black count', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: true,
          isLoggedIn: true,
          profile: {
            userId: 'U1234567890',
            displayName: 'Test User',
            pictureUrl: 'https://example.com/profile.jpg',
          },
          login: jest.fn(),
          logout: jest.fn(),
        };

        const { container } = render(<GameBoard />);
        const stoneCount = container.querySelector('.stone-count');
        const blackSection = stoneCount?.children[0];

        // Black section should have icon as first child
        const firstChild = blackSection?.children[0];
        expect(firstChild).toBeInstanceOf(HTMLImageElement);
      });

      it('should display white icon on the right side of white count', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: false,
          isLoggedIn: false,
          profile: null,
          login: jest.fn(),
          logout: jest.fn(),
        };

        const { container } = render(<GameBoard />);
        const stoneCount = container.querySelector('.stone-count');
        const whiteSection = stoneCount?.children[2];

        // White section should have icon as first child in DOM (CSS row-reverse makes it visually last)
        const firstChild = whiteSection?.firstElementChild;
        expect(firstChild).toHaveClass('stone-display');
        expect(firstChild).toHaveClass('stone-display-white');
      });

      it('should display profile icon for black player when available', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: true,
          isLoggedIn: true,
          profile: {
            userId: 'U1234567890',
            displayName: 'Test User',
            pictureUrl: 'https://example.com/profile.jpg',
          },
          login: jest.fn(),
          logout: jest.fn(),
        };

        render(<GameBoard />);

        const profileIcon = screen.getByTestId('profile-icon');
        expect(profileIcon).toBeInTheDocument();
        expect(profileIcon).toHaveAttribute(
          'src',
          'https://example.com/profile.jpg'
        );
      });

      it('should fallback to default stone icon when profile image fails', async () => {
        const { act } = await import('@testing-library/react');

        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: true,
          isLoggedIn: true,
          profile: {
            userId: 'U1234567890',
            displayName: 'Test User',
            pictureUrl: 'https://example.com/invalid.jpg',
          },
          login: jest.fn(),
          logout: jest.fn(),
        };

        const { rerender } = render(<GameBoard />);

        // Trigger image error
        const profileIcon = screen.getByTestId('profile-icon');
        expect(profileIcon).toBeInTheDocument();

        // Simulate image load error wrapped in act
        await act(async () => {
          const imgElement = profileIcon as HTMLImageElement;
          imgElement.dispatchEvent(new Event('error'));
        });

        // Re-render to reflect state change
        rerender(<GameBoard />);

        // After error, should show default icon
        expect(screen.getByTestId('default-profile-icon')).toBeInTheDocument();
      });

      it('should always use stone icon for white player', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: true,
          isLoggedIn: true,
          profile: {
            userId: 'U1234567890',
            displayName: 'Test User',
            pictureUrl: 'https://example.com/profile.jpg',
          },
          login: jest.fn(),
          logout: jest.fn(),
        };

        const { container } = render(<GameBoard />);
        const stoneCount = container.querySelector('.stone-count');
        const whiteSection = stoneCount?.children[2];

        // White section should have stone icon
        const whiteIcon = whiteSection?.querySelector('.stone-display-white');
        expect(whiteIcon).toBeInTheDocument();
      });
    });

    describe('Accessibility attributes', () => {
      it('should have aria-label on black score', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: false,
          isLoggedIn: false,
          profile: null,
          login: jest.fn(),
          logout: jest.fn(),
        };

        const { container } = render(<GameBoard />);
        const stoneCount = container.querySelector('.stone-count');
        const blackSection = stoneCount?.children[0];

        // Black count should have aria-label
        const blackCountElement = blackSection?.querySelector(
          '[aria-label*="Black score"]'
        );
        expect(blackCountElement).toBeInTheDocument();
      });

      it('should have aria-label on white score', () => {
        mockLiffState = {
          isReady: true,
          error: null,
          isInClient: false,
          isLoggedIn: false,
          profile: null,
          login: jest.fn(),
          logout: jest.fn(),
        };

        const { container } = render(<GameBoard />);
        const stoneCount = container.querySelector('.stone-count');
        const whiteSection = stoneCount?.children[2];

        // White count should have aria-label
        const whiteCountElement = whiteSection?.querySelector(
          '[aria-label*="White score"]'
        );
        expect(whiteCountElement).toBeInTheDocument();
      });
    });
  });
});
