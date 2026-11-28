// Jest reporter: when the run ends it builds the log report of that run.
const path = require('node:path');
const { buildLogReport } = require('./log-report');
const { config } = require('../../utils/env');

class LogReporter {
  onRunComplete(_contexts, results) {
    const runId = process.env.RUN_ID;
    const report = buildLogReport({
      runId,
      runDir: path.join(config.paths.logs, runId),
      reportsDir: config.paths.reports,
      env: config.env,
      testResults: results.testResults,
    });
    process.stdout.write(`\nLog report: ${report.file} (${report.logs} log lines, ${report.tests} tests)\n`);
  }
}

module.exports = LogReporter;
