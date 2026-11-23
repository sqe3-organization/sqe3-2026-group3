const { graphql } = require('./graphql-client');
const { logger } = require('../../core/logger');

const CREATE_BOARD = 'mutation ($name: String!, $kind: BoardKind!) { create_board(board_name: $name, board_kind: $kind, empty: true) { id } }';
const DELETE_BOARD = 'mutation ($board: ID!) { delete_board(board_id: $board) { id } }';
const CREATE_COLUMN = 'mutation ($board: ID!, $id: String!, $title: String!, $type: ColumnType!, $defaults: JSON) '
  + '{ create_column(board_id: $board, id: $id, title: $title, column_type: $type, defaults: $defaults) { id type } }';
const STATUS_LABELS = 'query ($ids: [ID!]) { boards(ids: $ids) { columns(ids: ["status"]) { settings_str } } }';

const boardsApi = {
  // kind: public, private or share (the free plan only allows public)
  async create(name, kind = 'public') {
    const res = await graphql(CREATE_BOARD, { name, kind });
    const id = res.data?.data?.create_board?.id;
    logger.info(`Board "${name}" created with id ${id}`);
    return { res, id };
  },

  async addColumn(boardId, column) {
    const defaults = column.defaults ? JSON.stringify(column.defaults) : undefined;
    const res = await graphql(CREATE_COLUMN, { board: boardId, ...column, defaults });
    logger.info(`Column ${column.id} (${column.type}) added to board ${boardId}`);
    return res;
  },

  async delete(boardId) {
    const res = await graphql(DELETE_BOARD, { board: boardId });
    logger.info(`Board ${boardId} deleted`);
    return res;
  },

  // labels of the status column, for example { 0: 'Working on it', 1: 'Done' }
  async statusLabels(boardId) {
    const res = await graphql(STATUS_LABELS, { ids: [boardId] });
    return JSON.parse(res.data.data.boards[0].columns[0].settings_str).labels;
  },
};

module.exports = { boardsApi };
