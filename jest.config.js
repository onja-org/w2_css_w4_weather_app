module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        outputPath: 'lab/tests/test-results.html',
        pageTitle: 'Weather App Test Results',
        includeFailureMsg: true,
        theme: 'lightTheme'
      }
    ]
  ]
};