import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

// Mock GameBoard component since it's a Client Component
jest.mock('@/components/GameBoard', () => {
  return function MockGameBoard() {
    return <div data-testid="game-board">GameBoard Component</div>;
  };
});

describe('Page (Server Component)', () => {
  it('should render', () => {
    render(<Page />);
    // ページが正常にレンダリングされることを確認
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('should display page title', () => {
    render(<Page />);
    // ヘッダーにタイトルが表示されることを確認
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('リバーシ');
  });

  it('should mount GameBoard component', () => {
    render(<Page />);
    // GameBoardコンポーネントがマウントされていることを確認
    const gameBoard = screen.getByTestId('game-board');
    expect(gameBoard).toBeInTheDocument();
    expect(gameBoard).toHaveTextContent('GameBoard Component');
  });

  it('should have correct HTML semantics', () => {
    const { container } = render(<Page />);
    // main要素が存在することを確認
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    // header要素が存在することを確認
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });
});
