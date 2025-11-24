import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout, { metadata, viewport } from '../layout';

// Mock LiffProvider to avoid LIFF SDK initialization in tests
jest.mock('@/contexts/LiffProvider', () => ({
  LiffProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="liff-provider">{children}</div>
  ),
}));

describe('RootLayout (Server Component)', () => {
  it('should have correct metadata', () => {
    expect(metadata).toEqual({
      title: 'LINE Reversi - リバーシゲーム',
      description: 'LINEミニアプリで遊べるリバーシゲーム。AIと対戦しよう!',
    });
  });

  it('should have correct viewport settings', () => {
    expect(viewport).toEqual({
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      themeColor: '#06C755',
    });
  });

  it('should render children correctly', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child">Test Content</div>
      </RootLayout>
    );

    expect(container.querySelector('html')).toBeInTheDocument();
    expect(container.querySelector('body')).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="child"]')
    ).toBeInTheDocument();
  });

  it('should have lang attribute set to "ja"', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'ja');
  });

  it('should be wrapped with LiffProvider', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child">Test Content</div>
      </RootLayout>
    );

    // LiffProvider should wrap the children
    const liffProvider = container.querySelector(
      '[data-testid="liff-provider"]'
    );
    expect(liffProvider).toBeInTheDocument();

    // Child should be inside LiffProvider
    const child = container.querySelector('[data-testid="child"]');
    expect(liffProvider).toContainElement(child as HTMLElement);
  });
});
