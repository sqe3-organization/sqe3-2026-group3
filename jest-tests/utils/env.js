// Loads the settings of the environment. Secrets only come from variables (.env or the terminal).
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

// variables that are already set in the terminal or in CI are not replaced
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const envName = process.env.TEST_ENV || 'default';
const settingsFile = path.join(ROOT, 'config', 'environments', `${envName}.json`);
if (!fs.existsSync(settingsFile)) {
  throw new Error(`TEST_ENV "${envName}" does not exist. Create config/environments/${envName}.json`);
}
const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));

const config = Object.freeze({
  ...settings,
  env: envName,
  token: process.env.MONDAY_TOKEN,
  logLevel: process.env.LOG_LEVEL || settings.logLevel,
  paths: {
    root: ROOT,
    logs: path.join(ROOT, 'logs'),
    reports: path.join(ROOT, 'reports'),
  },
});

module.exports = { config };
