import { expect } from 'chai';
import { config } from './config.js';
import { validate } from './schemas.js';
import { gql } from './client.js';
import { READ_ITEM } from './queries.js';

export const durations = [];

// checks that every response must pass (same as the collection script in Postman)
export function commonChecks(res) {
  durations.push(res.duration);
  expect(res.headers['content-type'], 'Content-Type').to.include('application/json');
  expect(res.duration, `response time (${res.duration} ms)`).to.be.below(config.maxResponseTime);
}

export function expectSchema(name, body) {
  expect(validate(name, body).join('; '), `schema ${name}`).to.equal('');
}

// successful change_multiple_column_values
export function expectChanged(res, itemId) {
  commonChecks(res);
  expect(res.status).to.equal(200);
  expect(res.data.errors, 'errors array').to.be.undefined;
  expectSchema('changeOk', res.data);
  expect(res.data.data.change_multiple_column_values.id).to.equal(String(itemId));
}

// GraphQL error with status 200
export function expectGqlError(res, { message, code } = {}) {
  commonChecks(res);
  expect(res.status).to.equal(200);
  expectSchema('errorResponse', res.data);
  if (message) expect(res.data.errors[0].message).to.include(message);
  if (code) expect(res.data.errors[0].extensions.code).to.equal(code);
  expect(res.data.data?.change_multiple_column_values ?? null, 'item data').to.equal(null);
}

// reads the item again
export async function readItem(itemId) {
  const res = await gql(READ_ITEM, { ids: [itemId] });
  expect(res.status).to.equal(200);
  const item = res.data.data.items[0];
  expectSchema('item', item);
  const cols = Object.fromEntries(item.column_values.map((c) => [c.id, c]));
  const date = cols.date4.value ? JSON.parse(cols.date4.value) : {};
  return {
    state: item.state,
    status: cols.status.text,
    date: date.date ?? null,
    time: date.time ?? null,
    text: cols.text.text,
    raw: cols,
  };
}

// [Data integrity] the item still has the values it should have
export async function expectItem(itemId, expected) {
  const item = await readItem(itemId);
  for (const [key, value] of Object.entries(expected)) {
    expect(item[key], `[Data integrity] ${key}`).to.equal(value);
  }
  return item;
}
