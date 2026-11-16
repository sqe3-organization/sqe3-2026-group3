// Tests that do not need a board or an item. They were the first ones migrated.
import { expect } from 'chai';
import { gql } from '../../src/client.js';
import { config } from '../../src/config.js';
import { commonChecks, expectGqlError, expectSchema } from '../../src/checks.js';
import { CHANGE, ME } from '../../src/queries.js';

describe('Column values - no preconditions', function () {
  this.noPreconditions = true;

  it('AUTH-001: Authorized request with the API token returns the user', async function () {
    const res = await gql(ME);
    commonChecks(res);
    expect(res.status).to.equal(200);
    expect(res.data.errors).to.be.undefined;
    expectSchema('me', res.data);
    expect(res.data.data.me.name).to.be.a('string').and.not.empty;
  });

  it('TC-COLVAL-008: Update with an invalid token is rejected', async function () {
    const res = await gql(CHANGE, { board: '1', item: '1', values: '{"text":"Hello"}' }, { token: config.invalidToken });
    commonChecks(res);
    expect(res.status).to.equal(401);
    expect(res.data.errors[0].extensions.code).to.equal('NOT_AUTHENTICATED');
    expect(res.data.data).to.be.undefined;
  });

  // with board and item ids that do not exist, monday checks the board first
  it('TC-COLVAL-016: board_id that does not exist returns an error', async function () {
    const res = await gql(CHANGE, { board: '1', item: '1', values: '{"text":"Hello"}' });
    expectGqlError(res, { message: 'board does not exist', code: 'InvalidBoardIdException' });
  });
});
