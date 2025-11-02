// Jest setup file for React Testing Library
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/jest-dom');

// LIFF Mock setup using official @line/liff-mock library
// Only initialize in jsdom environment (requires window object)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const liff = require('@line/liff');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LiffMockPlugin } = require('@line/liff-mock');

  // Register LIFF Mock Plugin
  liff.use(new LiffMockPlugin());

  // Initialize LIFF in mock mode
  liff.init({
    liffId: 'test-liff-id',
    mock: true,
  });
}
