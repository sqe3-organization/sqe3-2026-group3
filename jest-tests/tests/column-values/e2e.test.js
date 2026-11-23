// The steps share the item, so they run in order inside one describe.
// This suite creates its own item, it only uses the board precondition.
const { columnValuesApi } = require('../../main/api/column-values-api');
const { itemsApi } = require('../../main/api/items-api');
const { createContext } = require('../support/context');
const { useTestBoard, useDelay } = require('../support/hooks');
const { expectCommon, expectChanged, expectGqlError, expectItem } = require('../support/assertions');

const ctx = createContext();
const VALUES = { status: 'Done', date: '2026-11-15', text: 'E2E text' };
const CLEAR = { status: null, date: null, text: null };

describe('TC-COLVAL-020: Full flow of column values on a new item', () => {
  useTestBoard(ctx);
  useDelay();

  test('Step 1: Create item', async () => {
    const { res, id } = await itemsApi.create(ctx.boards.id, 'AT - COLVAL E2E');
    expectCommon(res);
    expect(res.data.errors).toBeUndefined();
    expect(id).toMatch(/^\d+$/);
    ctx.items = { id };
  });

  test('Step 2: Update three columns', async () => {
    const res = await columnValuesApi.change(ctx.boards.id, ctx.items.id, columnValuesApi.build(VALUES));
    expectChanged(res, ctx.items.id);
  });

  test('Step 3: Read the new values', async () => {
    await expectItem(ctx.items.id, VALUES);
  });

  test('Step 4: Clear columns', async () => {
    const res = await columnValuesApi.change(ctx.boards.id, ctx.items.id, columnValuesApi.build(CLEAR));
    expectChanged(res, ctx.items.id);
  });

  test('Step 5: Read the empty columns', async () => {
    const { values } = await itemsApi.readColumns(ctx.items.id);
    for (const column of Object.values(values.raw)) {
      expect(column.text || '').toBe('');
      expect(column.value).toBeNull();
    }
  });

  test('Step 6: Delete item', async () => {
    const res = await itemsApi.delete(ctx.items.id);
    expectCommon(res);
    expect(res.data.data.delete_item.id).toBe(ctx.items.id);
  });

  test('Step 7: Check item state', async () => {
    const res = await itemsApi.state(ctx.items.id);
    const [item] = res.data.data.items;
    // monday.com can return the item as deleted or not return it at all
    expect(item?.state ?? 'deleted').toBe('deleted');
  });

  test('Step 8: Update the deleted item', async () => {
    const res = await columnValuesApi.change(ctx.boards.id, ctx.items.id, columnValuesApi.build(VALUES));
    expectGqlError(res, { message: 'inactive items' });
  });
});
