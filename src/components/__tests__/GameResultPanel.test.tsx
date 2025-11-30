/**
 * GameResultPanel Component Tests
 *
 * TDD: RED phase - Tests written before implementation
 * Requirements: 1.1, 1.2, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 8.1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameResultPanel from '../GameResultPanel';
import type { Board, Player } from '@/lib/game/types';

// Mock useShare hook
const mockUseShare = {
  isShareReady: true,
  isSharing: false,
  canWebShare: true,
  shareImageUrl: 'https://example.com/share-image.png',
  hasPendingShare: false,
  handleLineShare: jest.fn(),
  handleWebShare: jest.fn(),
  prepareShareImage: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/hooks/useShare', () => ({
  useShare: () => mockUseShare,
}));

// Helper to create a test board
function createTestBoard(blackCount: number, whiteCount: number): Board {
  const board: (Player | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place black stones
  let blackPlaced = 0;
  for (let row = 0; row < 8 && blackPlaced < blackCount; row++) {
    for (let col = 0; col < 8 && blackPlaced < blackCount; col++) {
      board[row][col] = 'black';
      blackPlaced++;
    }
  }

  // Place white stones
  let whitePlaced = 0;
  for (let row = 7; row >= 0 && whitePlaced < whiteCount; row--) {
    for (let col = 7; col >= 0 && whitePlaced < whiteCount; col--) {
      if (board[row][col] === null) {
        board[row][col] = 'white';
        whitePlaced++;
      }
    }
  }

  return board;
}

describe('GameResultPanel', () => {
  const defaultProps = {
    board: createTestBoard(36, 28),
    blackCount: 36,
    whiteCount: 28,
    winner: 'black' as const,
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShare.isShareReady = true;
    mockUseShare.isSharing = false;
    mockUseShare.canWebShare = true;
    mockUseShare.prepareShareImage.mockResolvedValue(undefined);
  });

  describe('Winner Display (User perspective)', () => {
    it('should display "Your win!" when black wins', () => {
      render(<GameResultPanel {...defaultProps} winner="black" />);

      // Check the main panel text, not the ShareImagePreview
      const panel = screen.getByTestId('game-result-panel');
      const resultText = panel.querySelector('p');
      expect(resultText).toHaveTextContent('あなたの勝ち!');
    });

    it('should display "AI wins!" when white wins', () => {
      render(<GameResultPanel {...defaultProps} winner="white" />);

      // Check the main panel text, not the ShareImagePreview
      const panel = screen.getByTestId('game-result-panel');
      const resultText = panel.querySelector('p');
      expect(resultText).toHaveTextContent('AIの勝ち!');
    });

    it('should display "Draw" for draw result', () => {
      render(<GameResultPanel {...defaultProps} winner="draw" />);

      // Check the main panel text, not the ShareImagePreview
      const panel = screen.getByTestId('game-result-panel');
      const resultText = panel.querySelector('p');
      expect(resultText).toHaveTextContent('引き分け');
    });
  });

  describe('Score Display', () => {
    it('should display black stone count', () => {
      render(<GameResultPanel {...defaultProps} blackCount={40} />);

      expect(screen.getByTestId('black-score')).toHaveTextContent('40');
    });

    it('should display white stone count', () => {
      render(<GameResultPanel {...defaultProps} whiteCount={24} />);

      expect(screen.getByTestId('white-score')).toHaveTextContent('24');
    });
  });

  describe('Reset Button', () => {
    it('should render reset button with correct text', () => {
      render(<GameResultPanel {...defaultProps} />);

      const resetButton = screen.getByRole('button', {
        name: /新しいゲームを開始/i,
      });
      expect(resetButton).toBeInTheDocument();
    });

    it('should call onReset when reset button is clicked', () => {
      const onReset = jest.fn();
      render(<GameResultPanel {...defaultProps} onReset={onReset} />);

      const resetButton = screen.getByRole('button', {
        name: /新しいゲームを開始/i,
      });
      fireEvent.click(resetButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Share Buttons Integration', () => {
    it('should render ShareButtons component', () => {
      render(<GameResultPanel {...defaultProps} />);

      expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
    });

    it('should render LINE share button', () => {
      render(<GameResultPanel {...defaultProps} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      expect(lineButton).toBeInTheDocument();
    });

    it('should call handleLineShare when LINE button is clicked', () => {
      render(<GameResultPanel {...defaultProps} />);

      const lineButton = screen.getByRole('button', { name: /LINEでシェア/i });
      fireEvent.click(lineButton);

      expect(mockUseShare.handleLineShare).toHaveBeenCalledTimes(1);
    });

    it('should call handleWebShare when Web Share button is clicked', () => {
      render(<GameResultPanel {...defaultProps} />);

      const webShareButton = screen.getByRole('button', {
        name: /その他でシェア/i,
      });
      fireEvent.click(webShareButton);

      expect(mockUseShare.handleWebShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('ShareImagePreview Integration', () => {
    it('should render ShareImagePreview component', () => {
      render(<GameResultPanel {...defaultProps} />);

      expect(screen.getByTestId('share-image-preview')).toBeInTheDocument();
    });

    it('should pass board, scores, and winner to ShareImagePreview', () => {
      const board = createTestBoard(40, 24);
      render(
        <GameResultPanel
          {...defaultProps}
          board={board}
          blackCount={40}
          whiteCount={24}
          winner="black"
        />
      );

      const preview = screen.getByTestId('share-image-preview');
      expect(preview).toBeInTheDocument();

      // Check that the scores are displayed in ShareImagePreview
      expect(screen.getByTestId('share-image-scores')).toHaveTextContent('40');
      expect(screen.getByTestId('share-image-scores')).toHaveTextContent('24');
    });
  });

  describe('prepareShareImage on Mount', () => {
    it('should call prepareShareImage on component mount', async () => {
      render(<GameResultPanel {...defaultProps} />);

      await waitFor(() => {
        expect(mockUseShare.prepareShareImage).toHaveBeenCalledTimes(1);
      });
    });

    it('should pass correct arguments to prepareShareImage', async () => {
      const board = createTestBoard(35, 29);
      render(
        <GameResultPanel
          {...defaultProps}
          board={board}
          blackCount={35}
          whiteCount={29}
          winner="white"
        />
      );

      await waitFor(() => {
        expect(mockUseShare.prepareShareImage).toHaveBeenCalledWith(
          expect.any(Object), // containerRef
          board,
          35,
          29,
          'white'
        );
      });
    });
  });

  describe('Layout', () => {
    it('should have game-result container', () => {
      render(<GameResultPanel {...defaultProps} />);

      expect(screen.getByTestId('game-result-panel')).toBeInTheDocument();
    });

    it('should arrange reset button and share buttons horizontally', () => {
      render(<GameResultPanel {...defaultProps} />);

      const buttonsContainer = screen.getByTestId('result-buttons');
      expect(buttonsContainer).toHaveStyle({ display: 'flex' });
    });
  });

  describe('Web Share API not supported', () => {
    it('should not show Web Share button when canWebShare is false', () => {
      mockUseShare.canWebShare = false;

      render(<GameResultPanel {...defaultProps} />);

      const webShareButton = screen.queryByRole('button', {
        name: /その他でシェア/i,
      });
      expect(webShareButton).not.toBeInTheDocument();
    });
  });
});
