const { graphql } = require('./graphql-client');
const { logger } = require('../../core/logger');

const CHANGE = 'mutation ($board: ID!, $item: ID!, $values: JSON!, $createLabels: Boolean) '
  + '{ change_multiple_column_values(board_id: $board, item_id: $item, column_values: $values, '
  + 'create_labels_if_missing: $createLabels) { id name } }';

const columnValuesApi = {
  // { status, date, time, text } -> column_values of monday.com
  build({ status, date, time, text }) {
    const values = {};
    if (status !== undefined) values.status = status === null ? null : { label: status };
    if (date !== undefined) values.date4 = date === null ? null : { date, ...(time && { time }) };
    if (text !== undefined) values.text = text;
    return values;
  },

  // values can be an object or a string (to send malformed JSON on purpose)
  change(boardId, itemId, values, { createLabels = false, token } = {}) {
    const json = typeof values === 'string' ? values : JSON.stringify(values);
    logger.info(`Changing column values of item ${itemId}: ${json}`);
    return graphql(CHANGE, { board: boardId, item: itemId, values: json, createLabels }, { token });
  },
};

module.exports = { columnValuesApi };
