// Small random data for names, so two runs never use the same board or item name.
const { randomBytes } = require('node:crypto');

const PREFIX = 'AT';

function randomId(length = 6) {
  return randomBytes(length).toString('hex').slice(0, length);
}

function uniqueName(what) {
  return `${PREFIX} - ${what} ${randomId()}`;
}

function runStamp(date = new Date()) {
  return date.toISOString().slice(0, 16).replace('T', ' ');
}

module.exports = { randomId, uniqueName, runStamp };
