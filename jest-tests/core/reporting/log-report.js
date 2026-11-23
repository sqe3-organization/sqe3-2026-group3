// Builds an HTML report with the logs of one run (and the test results when Jest gives them).
const fs = require('node:fs');
const path = require('node:path');

const LEVELS = ['error', 'warn', 'info', 'http', 'debug'];

const escape = (text) => String(text ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function readLogs(runDir) {
  if (!fs.existsSync(runDir)) return [];
  return fs.readdirSync(runDir)
    .filter((file) => file.endsWith('.log'))
    .flatMap((file) => fs.readFileSync(path.join(runDir, file), 'utf8').split('\n').filter(Boolean))
    .map((line) => JSON.parse(line))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function requestStats(logs) {
  const durations = logs.filter((log) => log.level === 'http').map((log) => log.meta.duration).sort((a, b) => a - b);
  if (!durations.length) return { count: 0, avg: 0, p95: 0, max: 0 };
  const avg = Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length);
  const p95 = durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)];
  return { count: durations.length, avg, p95, max: durations.at(-1) };
}

// one row per test: status from Jest and the logs written while the test was running
function testRows(logs, testResults) {
  const rows = testResults.flatMap((file) => file.testResults.map((t) => ({
    name: t.fullName,
    status: t.status,
    duration: t.duration ?? 0,
    failure: t.failureMessages.join('\n'),
  })));
  return rows.map((row) => ({ ...row, logs: logs.filter((log) => log.test === row.name) }));
}

const logLine = (log) => `<tr class="${log.level}"><td>${log.timestamp.slice(11)}</td><td>${log.level.toUpperCase()}</td>`
  + `<td>${escape(log.file || '-')}</td><td>${escape(log.message)}</td></tr>`;

const logTable = (logs) => `<table class="logs"><tr><th>Time</th><th>Level</th><th>File</th><th>Message</th></tr>${logs.map(logLine).join('')}</table>`;

function renderHtml({ runId, env, logs, tests }) {
  const counts = Object.fromEntries(LEVELS.map((level) => [level, logs.filter((log) => log.level === level).length]));
  const stats = requestStats(logs);
  const passed = tests.filter((t) => t.status === 'passed').length;
  const failed = tests.filter((t) => t.status === 'failed').length;
  const host = logs[0]?.host ?? '-';
  const outsideTests = logs.filter((log) => !log.test);
  const problems = logs.filter((log) => log.level === 'error' || log.level === 'warn');

  const testTable = tests.map((t) => `<details class="${t.status}"><summary><b>${t.status.toUpperCase()}</b> ${escape(t.name)}`
    + ` <span>(${t.duration} ms, ${t.logs.length} logs)</span></summary>`
    + `${t.failure ? `<pre>${escape(t.failure)}</pre>` : ''}${logTable(t.logs)}</details>`).join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Log report ${runId}</title><style>
body{font-family:Arial,sans-serif;margin:24px;color:#222}h1{font-size:22px}h2{font-size:17px;margin-top:28px}
.cards{display:flex;gap:12px;flex-wrap:wrap}.card{border:1px solid #ccc;padding:10px 14px;min-width:110px}
.card b{display:block;font-size:20px}table{border-collapse:collapse;width:100%;font-size:12px;margin:6px 0}
td,th{border:1px solid #ddd;padding:3px 6px;text-align:left;vertical-align:top}th{background:#f2f2f2}
tr.error td{background:#fde2e2}tr.warn td{background:#fff4d6}tr.debug td{color:#777}
details{border:1px solid #ddd;margin:4px 0;padding:4px 8px}details.passed summary b{color:#1a7f37}
details.failed summary b{color:#c62828}summary span{color:#777}pre{white-space:pre-wrap;font-size:11px;background:#f7f7f7;padding:6px}
</style></head><body>
<h1>Log report of the run ${escape(runId)}</h1>
<p>Environment: <b>${escape(env)}</b> | Host: <b>${escape(host)}</b> | Log lines: <b>${logs.length}</b></p>
<div class="cards">
<div class="card">Tests<b>${tests.length}</b></div><div class="card">Passed<b>${passed}</b></div><div class="card">Failed<b>${failed}</b></div>
${LEVELS.map((level) => `<div class="card">${level.toUpperCase()}<b>${counts[level]}</b></div>`).join('')}
<div class="card">Requests<b>${stats.count}</b></div><div class="card">Average<b>${stats.avg} ms</b></div>
<div class="card">p95<b>${stats.p95} ms</b></div><div class="card">Max<b>${stats.max} ms</b></div>
</div>
<h2>Errors and warnings (${problems.length})</h2>${problems.length ? logTable(problems) : '<p>None.</p>'}
<h2>Tests</h2>${testTable || '<p>No test results, only logs.</p>'}
<h2>Logs outside the tests (beforeAll / afterAll)</h2>${logTable(outsideTests)}
</body></html>`;
}

function buildLogReport({ runId, runDir, reportsDir, env, testResults = [] }) {
  const logs = readLogs(runDir);
  const tests = testRows(logs, testResults);
  fs.mkdirSync(reportsDir, { recursive: true });
  const file = path.join(reportsDir, `log-report-${runId}.html`);
  fs.writeFileSync(file, renderHtml({ runId, env, logs, tests }));
  return { file, logs: logs.length, tests: tests.length };
}

module.exports = { buildLogReport, readLogs, requestStats };
