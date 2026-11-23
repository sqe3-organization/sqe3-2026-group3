const { createRunId } = require('./utils/run-id');

// One id per run. The logs of the run go to logs/<RUN_ID>/ and the report uses the same id.
process.env.RUN_ID ??= createRunId();

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['core/**/*.js', 'main/**/*.js', 'utils/**/*.js'],
  // monday.com has a rate limit, so the test files run one after the other
  maxWorkers: 1,
  testTimeout: 60000,
  verbose: true,
  reporters: ['default', '<rootDir>/core/reporting/log-reporter.js'],
};
