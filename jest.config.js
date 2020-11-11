/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  transform: {
    '^.+\\.tsx?$': require.resolve('ts-jest')
  },
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**', '!**/test/**'],
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: '<rootDir>/output/coverage/',
  moduleFileExtensions: ['ts', 'js'],
  modulePaths: ['<rootDir>/src/', '<rootDir>/test/', '<rootDir>/node_modules/'],
  testRegex: '.*\\.test.ts$',
  roots: ["<rootDir>/src", "<rootDir>/test"],
  setupFiles: ["<rootDir>/test/setup.ts"],
};

module.exports = config;
