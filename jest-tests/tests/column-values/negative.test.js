// Negative tests are the same steps with different data, so they read the cases from datasets:
// negative-cases.json -> TC-COLVAL-009 to 016 (moved from Lab 3)
// invalid-values.json -> extra cases generated with GenAI
const path = require('node:path');
const { columnValuesApi } = require('../../main/api/column-values-api');
const { loadDataset } = require('../../utils/data-loader');
const { createContext } = require('../support/context');
const { useTestBoard, useTestItem } = require('../support/hooks');
const { expectCommon, expectGqlError, expectItem } = require('../support/assertions');
const { eachRow } = require('../support/data-driven');

const DATA = path.join(__dirname, '..', 'data', 'column-values');
const ctx = createContext();

// the request is rejected and the item keeps the values of the precondition
async function rejectedAndUnchanged({ values, board, item, error }) {
  const res = await columnValuesApi.change(board ?? ctx.boards.id, item ?? ctx.items.id, values);
  expectGqlError(res, error);
  await expectItem(ctx.items.id, ctx.items.initial);
}

describe('Column values - Negative', () => {
  useTestBoard(ctx);
  useTestItem(ctx);

  test('TC-COLVAL-008: Update with an invalid token is rejected (item not changed)', async () => {
    const values = { status: { label: 'Done' }, text: 'Payment checked' };
    const res = await columnValuesApi.change(ctx.boards.id, ctx.items.id, values, { token: 'invalid_token_123' });
    expectCommon(res);
    expect(res.status).toBe(401);
    expect(res.data.errors[0].extensions.code).toBe('NOT_AUTHENTICATED');
    await expectItem(ctx.items.id, ctx.items.initial);
  });

  describe('cases from Lab 3', () => {
    eachRow(loadDataset(path.join(DATA, 'negative-cases.json')), '$id: $title', rejectedAndUnchanged);
  });

  describe('dataset generated with GenAI', () => {
    eachRow(loadDataset(path.join(DATA, 'invalid-values.json')), '$id: $title', rejectedAndUnchanged);
  });
});
