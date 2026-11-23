const { graphql } = require('./graphql-client');
const { logger } = require('../../core/logger');

const CREATE_ITEM = 'mutation ($board: ID!, $name: String!, $values: JSON) '
  + '{ create_item(board_id: $board, item_name: $name, column_values: $values) { id name } }';
const DELETE_ITEM = 'mutation ($item: ID!) { delete_item(item_id: $item) { id } }';
const READ_ITEM = 'query ($ids: [ID!]) { items(ids: $ids) { id state column_values(ids: ["status", "date4", "text"]) { id text value } } }';
const ITEM_STATE = 'query ($ids: [ID!]) { items(ids: $ids) { id state } }';

const itemsApi = {
  async create(boardId, name, values = {}) {
    const res = await graphql(CREATE_ITEM, { board: boardId, name, values: JSON.stringify(values) });
    const id = res.data?.data?.create_item?.id;
    logger.info(`Item "${name}" created with id ${id} on board ${boardId}`);
    return { res, id };
  },

  async delete(itemId) {
    const res = await graphql(DELETE_ITEM, { item: itemId });
    logger.info(`Item ${itemId} deleted`);
    return res;
  },

  read(itemId) {
    return graphql(READ_ITEM, { ids: [itemId] });
  },

  state(itemId) {
    return graphql(ITEM_STATE, { ids: [itemId] });
  },

  // reads the item and returns its columns in a simple form
  async readColumns(itemId) {
    const res = await this.read(itemId);
    const item = res.data?.data?.items?.[0];
    if (!item) return { res, item, values: null };
    const raw = Object.fromEntries(item.column_values.map((c) => [c.id, c]));
    const date = raw.date4.value ? JSON.parse(raw.date4.value) : {};
    const values = {
      state: item.state,
      status: raw.status.text,
      date: date.date ?? null,
      time: date.time ?? null,
      text: raw.text.text,
      raw,
    };
    return { res, item, values };
  },
};

module.exports = { itemsApi };
