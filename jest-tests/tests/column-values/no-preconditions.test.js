// Tests that do not need a board or an item.
const { usersApi } = require('../../main/api/users-api');
const { columnValuesApi } = require('../../main/api/column-values-api');
const { expectCommon, expectGqlError, expectSchema } = require('../support/assertions');

const INVALID_TOKEN = 'invalid_token_123';

describe('Column values - no preconditions', () => {
  test('AUTH-001: Authorized request with the API token returns the user', async () => {
    const res = await usersApi.me();
    expectCommon(res);
    expect(res.status).toBe(200);
    expect(res.data.errors).toBeUndefined();
    expectSchema('me', res.data);
    expect(res.data.data.me.name).not.toBe('');
  });

  test('TC-COLVAL-008: Update with an invalid token is rejected', async () => {
    const res = await columnValuesApi.change('1', '1', { text: 'Hello' }, { token: INVALID_TOKEN });
    expectCommon(res);
    expect(res.status).toBe(401);
    expect(res.data.errors[0].extensions.code).toBe('NOT_AUTHENTICATED');
    expect(res.data.data).toBeUndefined();
  });

  // with board and item ids that do not exist, monday checks the board first
  test('TC-COLVAL-016: board_id that does not exist returns an error', async () => {
    const res = await columnValuesApi.change('1', '1', { text: 'Hello' });
    expectGqlError(res, { message: 'board does not exist', code: 'InvalidBoardIdException' });
  });
});
