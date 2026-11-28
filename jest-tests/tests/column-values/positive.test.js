const { columnValuesApi } = require('../../main/api/column-values-api');
const { itemsApi } = require('../../main/api/items-api');
const { boardsApi } = require('../../main/api/boards-api');
const { createContext } = require('../support/context');
const { useTestBoard, useTestItem } = require('../support/hooks');
const { expectChanged, expectItem } = require('../support/assertions');

const ctx = createContext();
const change = (values, options) => columnValuesApi.change(ctx.boards.id, ctx.items.id, columnValuesApi.build(values), options);

describe('Column values - Positive', () => {
  useTestBoard(ctx);
  useTestItem(ctx);

  test('TC-COLVAL-001: Update status, date and text in one request', async () => {
    const res = await change({ status: 'Done', date: '2026-11-15', text: 'Payment checked' });
    expectChanged(res, ctx.items.id);
  });

  test('TC-COLVAL-002: Query the item after the update shows the new values', async () => {
    const values = { status: 'Done', date: '2026-11-15', text: 'Payment checked' };
    expectChanged(await change(values), ctx.items.id);
    await expectItem(ctx.items.id, values);
  });

  test('TC-COLVAL-003: Update only status, date and text keep their value', async () => {
    expectChanged(await change({ status: 'Stuck' }), ctx.items.id);
    await expectItem(ctx.items.id, { ...ctx.items.initial, status: 'Stuck' });
  });

  test('TC-COLVAL-004: Update status using the label index', async () => {
    const res = await columnValuesApi.change(ctx.boards.id, ctx.items.id, { status: { index: 1 } });
    expectChanged(res, ctx.items.id);
    await expectItem(ctx.items.id, { ...ctx.items.initial, status: 'Done' });
  });

  test('TC-COLVAL-005: Update date with date and time', async () => {
    expectChanged(await change({ date: '2026-11-15', time: '14:30:00' }), ctx.items.id);
    await expectItem(ctx.items.id, { ...ctx.items.initial, date: '2026-11-15', time: '14:30:00' });
  });

  test('TC-COLVAL-006: Clear the three columns sending null', async () => {
    expectChanged(await change({ status: null, date: null, text: null }), ctx.items.id);
    const { values } = await itemsApi.readColumns(ctx.items.id);
    for (const column of Object.values(values.raw)) {
      expect(column.text || '').toBe('');
      expect(column.value).toBeNull();
    }
  });

  test('TC-COLVAL-007: New status label is created with create_labels_if_missing', async () => {
    expectChanged(await change({ status: 'QA Review' }, { createLabels: true }), ctx.items.id);
    await expectItem(ctx.items.id, { status: 'QA Review' });
    const labels = await boardsApi.statusLabels(ctx.boards.id);
    expect(Object.values(labels)).toContain('QA Review');
  });
});
