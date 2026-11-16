import { expect } from 'chai';
import { gql } from '../../src/client.js';
import { ctx } from '../../src/board-hooks.js';
import { expectChanged, expectItem, readItem } from '../../src/checks.js';
import { CHANGE, CHANGE_WITH_LABELS, INITIAL, STATUS_LABELS } from '../../src/queries.js';

const change = (values, query = CHANGE) =>
  gql(query, { board: ctx.boardId, item: ctx.itemId, values: JSON.stringify(values) });

describe('Column values - Positive', function () {
  it('TC-COLVAL-001: Update status, date and text in one request', async function () {
    const res = await change({ status: { label: 'Done' }, date4: { date: '2026-11-15' }, text: 'Payment checked' });
    expectChanged(res, ctx.itemId);
  });

  it('TC-COLVAL-002: Query the item after the update shows the new values', async function () {
    const res = await change({ status: { label: 'Done' }, date4: { date: '2026-11-15' }, text: 'Payment checked' });
    expectChanged(res, ctx.itemId);
    await expectItem(ctx.itemId, { status: 'Done', date: '2026-11-15', text: 'Payment checked' });
  });

  it('TC-COLVAL-003: Update only status, date and text keep their value', async function () {
    const res = await change({ status: { label: 'Stuck' } });
    expectChanged(res, ctx.itemId);
    await expectItem(ctx.itemId, { status: 'Stuck', date: INITIAL.date, text: INITIAL.text });
  });

  it('TC-COLVAL-004: Update status using the label index', async function () {
    const res = await change({ status: { index: 1 } });
    expectChanged(res, ctx.itemId);
    await expectItem(ctx.itemId, { status: 'Done', date: INITIAL.date, text: INITIAL.text });
  });

  it('TC-COLVAL-005: Update date with date and time', async function () {
    const res = await change({ date4: { date: '2026-11-15', time: '14:30:00' } });
    expectChanged(res, ctx.itemId);
    await expectItem(ctx.itemId, { status: INITIAL.status, date: '2026-11-15', time: '14:30:00', text: INITIAL.text });
  });

  it('TC-COLVAL-006: Clear the three columns sending null', async function () {
    const res = await change({ status: null, date4: null, text: null });
    expectChanged(res, ctx.itemId);
    const item = await readItem(ctx.itemId);
    for (const id of ['status', 'date4', 'text']) {
      expect(item.raw[id].text || '', `[Data integrity] ${id} text`).to.equal('');
      expect(item.raw[id].value, `[Data integrity] ${id} value`).to.equal(null);
    }
  });

  it('TC-COLVAL-007: New status label is created with create_labels_if_missing', async function () {
    const res = await change({ status: { label: 'QA Review' } }, CHANGE_WITH_LABELS);
    expectChanged(res, ctx.itemId);
    await expectItem(ctx.itemId, { status: 'QA Review' });
    const board = await gql(STATUS_LABELS, { ids: [ctx.boardId] });
    const labels = JSON.parse(board.data.data.boards[0].columns[0].settings_str).labels;
    expect(Object.values(labels), '[Data integrity] board labels').to.include('QA Review');
  });
});
