// Root hook plugin, loaded by .mocharc.json for every run.
import { durations } from '../src/checks.js';

export const mochaHooks = {
  beforeAll() {
    console.log(`  run started ${new Date().toLocaleString()}`);
  },
  afterAll() {
    if (!durations.length) return;
    const sorted = [...durations].sort((a, b) => a - b);
    const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
    console.log(`\n  ${sorted.length} requests checked, average ${avg} ms, max ${sorted.at(-1)} ms`);
  },
};
