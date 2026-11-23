// Pre and post conditions shared by the suites. Call them inside a describe.
const { boardsApi } = require('../../main/api/boards-api');
const { itemsApi } = require('../../main/api/items-api');
const { columnValuesApi } = require('../../main/api/column-values-api');
const testBoard = require('../../main/resources/data/test-board.json');
const { uniqueName, runStamp } = require('../../core/fake-data');
const { logger } = require('../../core/logger');
const { config } = require('../../utils/env');
const { wait } = require('../../utils/wait');

const SETUP_TIMEOUT = 120000;

// precondition of the suite: a board with the status, date and text columns
function useTestBoard(ctx) {
  beforeAll(async () => {
    expect(config.token).toBeTruthy(); // MONDAY_TOKEN is missing (see .env.example)
    logger.info('[precondition] creating the test board');
    const name = `${uniqueName('Lab 4 board')} ${runStamp()}`;
    const { res, id } = await boardsApi.create(name, testBoard.kind);
    expect(res.data.errors).toBeUndefined();
    ctx.boards = { id, name };
    for (const column of testBoard.columns) {
      const created = await boardsApi.addColumn(id, column);
      expect(created.data.errors).toBeUndefined();
    }
  }, SETUP_TIMEOUT);

  afterAll(async () => {
    if (!ctx.boards.id) return;
    logger.info('[postcondition] deleting the test board');
    await boardsApi.delete(ctx.boards.id);
  }, SETUP_TIMEOUT);
}

// waits before each test because of the monday.com rate limit
function useDelay() {
  beforeEach(() => wait(config.delayBetweenTestsMs), SETUP_TIMEOUT);
}

// precondition of each test: a new item with the initial values. It is deleted after the test.
function useTestItem(ctx) {
  useDelay();

  beforeEach(async () => {
    const initial = testBoard.initialItem;
    const { res, id } = await itemsApi.create(ctx.boards.id, uniqueName('item'), columnValuesApi.build(initial));
    expect(res.data.errors).toBeUndefined();
    ctx.items = { id, initial };
    logger.info(`[precondition] item ${id} ready with ${JSON.stringify(initial)}`);
  }, SETUP_TIMEOUT);

  afterEach(async () => {
    if (!ctx.items.id) return;
    logger.info(`[postcondition] deleting item ${ctx.items.id}`);
    await itemsApi.delete(ctx.items.id);
  }, SETUP_TIMEOUT);
}

module.exports = { useTestBoard, useTestItem, useDelay };
