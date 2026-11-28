// monday.com has one GraphQL endpoint. This file builds the body and adds the token.
const { RequestManager } = require('../../core/request-manager');
const { config } = require('../../utils/env');

// name of the first field of the query, used in the logs: create_item, items, me...
const operationName = (query) => query.match(/\{\s*(\w+)/)?.[1] ?? 'graphql';

function graphql(query, variables = {}, { token = config.token } = {}) {
  return RequestManager.getInstance().post('', { query, variables }, {
    headers: { Authorization: token },
    name: operationName(query),
  });
}

module.exports = { graphql };
