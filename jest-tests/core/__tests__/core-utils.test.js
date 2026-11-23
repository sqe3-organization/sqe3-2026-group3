const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateSchema } = require('../schema-validator');
const { uniqueName } = require('../fake-data');
const { requestStats } = require('../reporting/log-report');
const { loadCsv } = require('../../utils/data-loader');

describe('Core utilities', () => {
  test('validateSchema returns the errors of the body', () => {
    const schema = { type: 'object', required: ['id'], properties: { id: { type: 'string' } } };
    expect(validateSchema(schema, { id: '1' })).toEqual([]);
    expect(validateSchema(schema, { id: 1 })).toEqual(['/id must be string']);
  });

  test('uniqueName gives a different name each time', () => {
    expect(uniqueName('item')).toMatch(/^AT - item [0-9a-f]{6}$/);
    expect(uniqueName('item')).not.toBe(uniqueName('item'));
  });

  test('loadCsv reads quoted values with commas', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'csv-')), 'data.csv');
    fs.writeFileSync(file, 'id,title\n# comment\nA-1,"one, two"\nA-2,"say ""hi"""\n');
    expect(loadCsv(file)).toEqual([{ id: 'A-1', title: 'one, two' }, { id: 'A-2', title: 'say "hi"' }]);
  });

  test('requestStats uses only the http logs', () => {
    const logs = [10, 20, 30, 40].map((duration) => ({ level: 'http', meta: { duration } }));
    logs.push({ level: 'info', message: 'not a request' });
    expect(requestStats(logs)).toEqual({ count: 4, avg: 25, p95: 40, max: 40 });
  });
});
