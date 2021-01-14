module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['./__tests__/setup.js'],
  testMatch: ['**/__tests__/specs/**/*.[jt]s?(x)', '**/?(*.)+(spec).[jt]s?(x)'],
  modulePaths: ['src/', '__tests__'],
  moduleNameMapper: {
    'tests/(.*)': '<rootDir>/__tests__/$1',
  },
  testPathIgnorePatterns: ['.mock.js'],
}
