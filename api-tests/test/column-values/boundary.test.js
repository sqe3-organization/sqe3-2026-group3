import { gql } from '../../src/client.js';
import { ctx } from '../../src/board-hooks.js';
import { expectChanged, expectGqlError, expectItem } from '../../src/checks.js';
import { CHANGE, INITIAL } from '../../src/queries.js';

const change = (values) => gql(CHANGE, { board: ctx.boardId, item: ctx.itemId, values: JSON.stringify(values) });
const SPECIAL = 'Ñandú QA #1 <test> & "quotes"';

describe('Column values - Boundary', function () {
  it('TC-COLVAL-017: Leap day date is saved', async function () {
    expectChanged(await change({ date4: { date: '2028-02-29' } }), ctx.itemId);
    await expectItem(ctx.itemId, { date: '2028-02-29', status: INITIAL.status, text: INITIAL.text });
  });

  // known defect BUG-01: monday saves the impossible date
  it('TC-COLVAL-018: 29 Feb in a non leap year returns an error [BUG-01]', async function () {
    expectGqlError(await change({ date4: { date: '2027-02-29' } }), { message: 'invalid value' });
    await expectItem(ctx.itemId, { date: INITIAL.date });
  });

  // known defect BUG-02: <test> is removed from the text
  it('TC-COLVAL-019: Text with special characters is saved the same [BUG-02]', async function () {
    expectChanged(await change({ text: SPECIAL }), ctx.itemId);
    await expectItem(ctx.itemId, { text: SPECIAL });
  });
});
