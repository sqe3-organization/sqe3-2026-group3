// Logger of the framework (winston). See docs/FRAMEWORK.md for the conventions.
// Console: readable lines. File: one JSON line per log, used to build the log report.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const winston = require('winston');
const Transport = require('winston-transport');
const { config } = require('../utils/env');
const { createRunId } = require('../utils/run-id');

const runId = process.env.RUN_ID || createRunId();
const worker = process.env.JEST_WORKER_ID || '1';
const runDir = path.join(config.paths.logs, runId);
const logFile = path.join(runDir, `worker-${worker}.log`);
fs.mkdirSync(runDir, { recursive: true });

// adds the test file and the test name that is running (empty in beforeAll/afterAll)
const testInfo = winston.format((info) => {
  const state = globalThis.expect?.getState?.() ?? {};
  info.file = state.testPath ? path.relative(config.paths.root, state.testPath).split(path.sep).join('/') : '';
  info.test = state.currentTestName ?? '';
  return info;
});

const consoleLine = winston.format.printf(({ timestamp, level, message, file }) =>
  `${timestamp} | ${level.toUpperCase().padEnd(5)} | ${os.hostname()} | pid ${process.pid} | w${worker} | ${file || '-'} | ${message}`);

// writes each line right away, so no log is lost when Jest closes the test file
class SyncFileTransport extends Transport {
  log(info, next) {
    const { timestamp, level, message, file, test, ...meta } = info;
    const line = { timestamp, level, host: os.hostname(), pid: process.pid, worker, file, test, message };
    if (Object.keys(meta).length) line.meta = meta;
    fs.appendFileSync(logFile, `${JSON.stringify(line)}\n`);
    next();
  }
}

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(testInfo(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' })),
  transports: [
    new winston.transports.Console({
      level: config.consoleLogLevel,
      format: winston.format.combine(consoleLine, winston.format.colorize({ all: true })),
    }),
    new SyncFileTransport({ level: config.logLevel }),
  ],
});

module.exports = { logger, runId, runDir };
