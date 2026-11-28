// Reads the datasets used by the data driven tests (JSON or CSV).
const fs = require('node:fs');
const path = require('node:path');

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// simple CSV: first line is the header, values with commas go between double quotes
function loadCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim() && !line.startsWith('#'));
  const header = splitCsvLine(lines.shift());
  return lines.map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(header.map((key, i) => [key, values[i] ?? '']));
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((value) => value.trim());
}

function loadDataset(file) {
  return path.extname(file) === '.csv' ? loadCsv(file) : loadJson(file);
}

module.exports = { loadDataset, loadJson, loadCsv };
