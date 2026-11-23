// Builds the log report again from the files in logs/, without running the tests.
// usage: npm run report:logs            -> last run
//        npm run report:logs -- <runId> -> one run
const fs = require('node:fs');
const path = require('node:path');
const { buildLogReport } = require('./log-report');
const { config } = require('../../utils/env');

const runs = fs.existsSync(config.paths.logs) ? fs.readdirSync(config.paths.logs).sort() : [];
const runId = process.argv[2] ?? runs.at(-1);
if (!runId) {
  process.stderr.write('There are no logs yet. Run the tests first.\n');
  process.exit(1);
}

const report = buildLogReport({
  runId,
  runDir: path.join(config.paths.logs, runId),
  reportsDir: config.paths.reports,
  env: config.env,
});
process.stdout.write(`Log report: ${report.file} (${report.logs} log lines)\n`);
