/** @type {import('jest').Config} */
const config = {
  projects: [
    // Node environment for unit and integration tests
    {
      displayName: 'unit',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: 'tsconfig.json',
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: ['<rootDir>/__tests__/unit/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 30000,
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: 'tsconfig.json',
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: ['<rootDir>/__tests__/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 30000,
    },
    // jsdom environment for React component tests
    {
      displayName: 'components',
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: 'tsconfig.json',
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: ['<rootDir>/__tests__/components/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.components.js'],
      testTimeout: 10000,
    },
  ],
};

module.exports = config;
