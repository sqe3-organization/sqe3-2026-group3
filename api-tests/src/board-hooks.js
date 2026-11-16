// Hooks for the monday.com suites.
// Importing this file registers root hooks: one board for the whole run,
// and a new item before each test that is deleted after it.
import { expect } from 'chai';
import { gql, sleep } from './client.js';
import { config } from './config.js';
import { CREATE_BOARD, CREATE_COLUMN, CREATE_ITEM, DELETE_BOARD, DELETE_ITEM, INITIAL_VALUES } from './queries.js';

export const ctx = { boardId: null, itemId: null };

// a suite can set this.ownItem = true (E2E creates its own item)
// or this.noPreconditions = true (nothing is created for it)
const flag = (test, name) => {
  for (let s = test.parent; s; s = s.parent) if (s[name]) return true;
  return false;
};

before('create the test board', async function () {
  this.timeout(120000);
  expect(config.token, 'MONDAY_TOKEN env variable').to.be.a('string').and.not.empty;
  const board = await gql(CREATE_BOARD, { name: `AT - SQE3 Lab 3 run ${new Date().toISOString().slice(0, 16)}` });
  ctx.boardId = board.data.data.create_board.id;
  const columns = [
    { id: 'status', title: 'Status', type: 'status', defaults: JSON.stringify({ labels: { 0: 'Working on it', 1: 'Done', 2: 'Stuck' } }) },
    { id: 'date4', title: 'Date', type: 'date' },
    { id: 'text', title: 'Text', type: 'text' },
  ];
  for (const c of columns) {
    const res = await gql(CREATE_COLUMN, { board: ctx.boardId, ...c });
    expect(res.data.errors, `create column ${c.id}`).to.be.undefined;
  }
});

after('delete the test board', async function () {
  this.timeout(60000);
  if (ctx.boardId) await gql(DELETE_BOARD, { board: ctx.boardId });
});

beforeEach('wait and create the item', async function () {
  this.timeout(120000);
  ctx.itemId = null;
  if (flag(this.currentTest, 'noPreconditions')) return;
  await sleep(config.delayBetweenTests);
  if (flag(this.currentTest, 'ownItem')) return;
  const name = `AT - item ${Math.random().toString(36).slice(2, 8)}`;
  const res = await gql(CREATE_ITEM, { board: ctx.boardId, name, values: INITIAL_VALUES });
  ctx.itemId = res.data.data.create_item.id;
});

afterEach('delete the item', async function () {
  this.timeout(60000);
  if (ctx.itemId) await gql(DELETE_ITEM, { item: ctx.itemId });
});
