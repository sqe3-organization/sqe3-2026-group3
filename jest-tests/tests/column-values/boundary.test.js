// Boundary tests. TC-COLVAL-017 to 019 come from Lab 3, the rest use datasets generated with GenAI:
// text-values.json (text column) and dates.csv (date column).
const path = require('node:path');
const { columnValuesApi } = require('../../main/api/column-values-api');
const { loadDataset } = require('../../utils/data-loader');
const { createContext } = require('../support/context');
const { useTestBoard, useTestItem } = require('../support/hooks');
const { expectChanged, expectGqlError, expectItem } = require('../support/assertions');
const { eachRow } = require('../support/data-driven');

const DATA = path.join(__dirname, '..', 'data', 'column-values');
const SPECIAL = 'Ñandú QA #1 <test> & "quotes"';
const ctx = createContext();

const change = (values) => columnValuesApi.change(ctx.boards.id, ctx.items.id, columnValuesApi.build(values));

// CSV values are text: time is empty when the row has no time
const dateRows = loadDataset(path.join(DATA, 'dates.csv')).map((row) => ({ ...row, time: row.time || null }));
const textRows = loadDataset(path.join(DATA, 'text-values.json')).map((row) => ({
  ...row,
  value: row.value.repeat(row.repeat ?? 1),
  expected: row.expected ?? row.value.repeat(row.repeat ?? 1),
}));

describe('Column values - Boundary', () => {
  useTestBoard(ctx);
  useTestItem(ctx);

  test('TC-COLVAL-017: Leap day date is saved', async () => {
    expectChanged(await change({ date: '2028-02-29' }), ctx.items.id);
    await expectItem(ctx.items.id, { ...ctx.items.initial, date: '2028-02-29' });
  });

  // known defect BUG-01: monday saves the impossible date
  test.failing('TC-COLVAL-018: 29 Feb in a non leap year returns an error [BUG-01]', async () => {
    expectGqlError(await change({ date: '2027-02-29' }), { message: 'invalid value' });
    await expectItem(ctx.items.id, ctx.items.initial);
  });

  // known defect BUG-02: <test> is removed from the text
  test.failing('TC-COLVAL-019: Text with special characters is saved the same [BUG-02]', async () => {
    expectChanged(await change({ text: SPECIAL }), ctx.items.id);
    await expectItem(ctx.items.id, { text: SPECIAL });
  });

  describe('text values (GenAI dataset)', () => {
    eachRow(textRows, '$id: $title', async ({ value, expected }) => {
      expectChanged(await change({ text: value }), ctx.items.id);
      await expectItem(ctx.items.id, { ...ctx.items.initial, text: expected });
    });
  });

  describe('dates (GenAI dataset)', () => {
    eachRow(dateRows, '$id: $title', async ({ date, time, valid }) => {
      const res = await change({ date, time });
      if (valid === 'yes') {
        expectChanged(res, ctx.items.id);
        await expectItem(ctx.items.id, { ...ctx.items.initial, date, time });
      } else {
        expectGqlError(res, { code: 'ColumnValueException' });
        await expectItem(ctx.items.id, ctx.items.initial);
      }
    });
  });
});
