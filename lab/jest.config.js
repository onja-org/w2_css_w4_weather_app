module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        outputPath: 'tests/test-results.html',
        pageTitle: 'Weather App Test Results',
        includeFailureMsg: true,
        theme: 'lightTheme'
      }
    ]
  ]
};