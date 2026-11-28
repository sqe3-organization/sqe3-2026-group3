// Checks used by the tests of column values.
const schemas = require('../../main/resources/schemas');
const { itemsApi } = require('../../main/api/items-api');
const { validateSchema } = require('../../core/schema-validator');
const { config } = require('../../utils/env');

// every response: JSON and below the response time limit
function expectCommon(res) {
  expect(res.headers['content-type']).toContain('application/json');
  expect(res.duration).toBeLessThan(config.maxResponseTimeMs);
}

function expectSchema(name, body) {
  expect(validateSchema(schemas[name], body)).toEqual([]);
}

// change_multiple_column_values worked
function expectChanged(res, itemId) {
  expectCommon(res);
  expect(res.status).toBe(200);
  expect(res.data.errors).toBeUndefined();
  expectSchema('changeOk', res.data);
  expect(res.data.data.change_multiple_column_values.id).toBe(String(itemId));
}

// GraphQL error, monday.com answers with status 200 and an errors array
function expectGqlError(res, { message, code } = {}) {
  expectCommon(res);
  expect(res.status).toBe(200);
  expectSchema('errorResponse', res.data);
  if (message) expect(res.data.errors[0].message).toContain(message);
  if (code) expect(res.data.errors[0].extensions.code).toBe(code);
  expect(res.data.data?.change_multiple_column_values ?? null).toBeNull();
}

// [Data integrity] reads the item again and compares only the given fields
async function expectItem(itemId, expected) {
  const { res, item, values } = await itemsApi.readColumns(itemId);
  expect(res.status).toBe(200);
  expectSchema('item', item);
  const actual = Object.fromEntries(Object.keys(expected).map((key) => [key, values[key]]));
  expect(actual).toEqual(expected);
  return values;
}

module.exports = { expectCommon, expectSchema, expectChanged, expectGqlError, expectItem };
