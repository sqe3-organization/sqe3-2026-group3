import { expect } from 'chai';
import { gql } from '../../src/client.js';
import { config } from '../../src/config.js';
import { ctx } from '../../src/board-hooks.js';
import { commonChecks, expectGqlError, expectItem } from '../../src/checks.js';
import { CHANGE, INITIAL } from '../../src/queries.js';

const change = (values, extra = {}, options) =>
  gql(CHANGE, { board: ctx.boardId, item: ctx.itemId, values, ...extra }, options);

// after a rejected update the item must keep the values from the precondition
const unchanged = () => expectItem(ctx.itemId, { status: INITIAL.status, date: INITIAL.date, text: INITIAL.text });

describe('Column values - Negative', function () {
  it('TC-COLVAL-008: Update with an invalid token is rejected (item not changed)', async function () {
    const res = await change(JSON.stringify({ status: { label: 'Done' }, text: 'Payment checked' }), {}, { token: config.invalidToken });
    commonChecks(res);
    expect(res.status).to.equal(401);
    expect(res.data.errors[0].extensions.code).to.equal('NOT_AUTHENTICATED');
    await unchanged();
  });

  it('TC-COLVAL-009: Malformed JSON in column_values returns an error', async function () {
    expectGqlError(await change('{"text":"Broken"'), { message: 'invalid value' });
    await unchanged();
  });

  it('TC-COLVAL-010: Column id that does not exist returns an error', async function () {
    expectGqlError(await change('{"fake_column_123":"Hello"}'), { message: 'column ID', code: 'InvalidColumnIdException' });
    await unchanged();
  });

  it('TC-COLVAL-011: Status label that does not exist returns an error', async function () {
    expectGqlError(await change('{"status":{"label":"Finished"}}'), { message: 'label', code: 'ColumnValueException' });
    await unchanged();
  });

  it('TC-COLVAL-012: Valid column together with a wrong column id saves nothing', async function () {
    expectGqlError(await change('{"text":"Should not save","fake_column_123":"x"}'), { message: 'column ID', code: 'InvalidColumnIdException' });
    await unchanged();
  });

  it('TC-COLVAL-013: Status index that does not exist returns an error', async function () {
    expectGqlError(await change('{"status":{"index":99}}'), { message: 'label does not exist', code: 'ColumnValueException' });
    await unchanged();
  });

  it('TC-COLVAL-014: Date in a wrong format returns an error', async function () {
    expectGqlError(await change('{"date4":{"date":"15/11/2026"}}'), { message: 'invalid value', code: 'ColumnValueException' });
    await unchanged();
  });

  it('TC-COLVAL-015: item_id that does not exist returns an error', async function () {
    expectGqlError(await change('{"text":"Hello"}', { item: '1' }), { message: 'Item not found', code: 'InvalidItemIdException' });
  });

  it('TC-COLVAL-016: board_id that does not exist returns an error', async function () {
    expectGqlError(await change('{"text":"Hello"}', { board: '1' }), { message: 'board does not exist', code: 'InvalidBoardIdException' });
    await unchanged();
  });
});
