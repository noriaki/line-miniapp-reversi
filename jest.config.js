module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed to jsdom for React component testing
  roots: ['<rootDir>/src', '<rootDir>/app'], // Added app directory
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx', // Added .tsx pattern
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx', // Added .tsx pattern
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react', // Enable JSX support
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Path alias support
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // For testing-library setup
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}', // Include app directory in coverage
    '!src/**/*.d.ts',
    '!app/**/*.d.ts',
    '!src/**/__tests__/**',
    '!app/**/__tests__/**',
    '!src/**/__mocks__/**', // Exclude mock files (test infrastructure)
    '!app/**/__mocks__/**', // Exclude mock files (test infrastructure)
    '!src/hooks/worker-factory.ts', // Exclude worker factory (import.meta.url not testable in Jest)
    '!src/workers/**', // Exclude Web Workers (difficult to test in Node.js)
    '!src/lib/liff/**', // Exclude LIFF integration (Requirement 9.4)
    '!src/contexts/Liff*.tsx', // Exclude LIFF Context/Provider (Requirement 9.4)
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
