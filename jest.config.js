/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  transform: {
    '^.+\\.tsx?$': require.resolve('ts-jest'),
  },
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**', '!**/test/**'],
  coverageReporters: [['lcov', { projectRoot: '../../' }], 'text-summary'],
  coverageDirectory: '<rootDir>/output/coverage-backend/',
  moduleFileExtensions: ['ts', 'js'],
  modulePaths: ['<rootDir>/src/', '<rootDir>/test/', '<rootDir>/node_modules/'],
  testRegex: '.*\\.test.ts$',
};

module.exports = config;
