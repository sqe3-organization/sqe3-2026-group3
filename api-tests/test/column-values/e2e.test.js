import { expect } from 'chai';
import { gql } from '../../src/client.js';
import { ctx } from '../../src/board-hooks.js';
import { commonChecks, expectChanged, expectGqlError, expectItem, readItem } from '../../src/checks.js';
import { CHANGE, CREATE_ITEM, DELETE_ITEM, ITEM_STATE } from '../../src/queries.js';

const VALUES = JSON.stringify({ status: { label: 'Done' }, date4: { date: '2026-11-15' }, text: 'E2E text' });
const CLEAR = JSON.stringify({ status: null, date4: null, text: null });

// the steps share the item id, so they run in order inside one suite
describe('TC-COLVAL-020: Full flow of column values on a new item', function () {
  this.ownItem = true;
  let itemId;

  it('Step 1: Create item', async function () {
    const res = await gql(CREATE_ITEM, { board: ctx.boardId, name: 'AT - COLVAL E2E', values: '{}' });
    commonChecks(res);
    expect(res.data.errors).to.be.undefined;
    itemId = res.data.data.create_item.id;
    expect(itemId).to.match(/^\d+$/);
  });

  it('Step 2: Update three columns', async function () {
    expectChanged(await gql(CHANGE, { board: ctx.boardId, item: itemId, values: VALUES }), itemId);
  });

  it('Step 3: Read the new values', async function () {
    await expectItem(itemId, { status: 'Done', date: '2026-11-15', text: 'E2E text' });
  });

  it('Step 4: Clear columns', async function () {
    expectChanged(await gql(CHANGE, { board: ctx.boardId, item: itemId, values: CLEAR }), itemId);
  });

  it('Step 5: Read the empty columns', async function () {
    const item = await readItem(itemId);
    for (const c of Object.values(item.raw)) {
      expect(c.text || '', c.id).to.equal('');
      expect(c.value, c.id).to.equal(null);
    }
  });

  it('Step 6: Delete item', async function () {
    const res = await gql(DELETE_ITEM, { item: itemId });
    commonChecks(res);
    expect(res.data.data.delete_item.id).to.equal(itemId);
  });

  it('Step 7: Check item state', async function () {
    const res = await gql(ITEM_STATE, { ids: [itemId] });
    const items = res.data.data.items;
    if (items.length) expect(items[0].state).to.equal('deleted');
  });

  it('Step 8: Update the deleted item', async function () {
    expectGqlError(await gql(CHANGE, { board: ctx.boardId, item: itemId, values: VALUES }), { message: 'inactive items' });
  });
});
