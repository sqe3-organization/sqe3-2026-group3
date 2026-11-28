// Same queries used in the Postman collection (Lab 2)
export const CREATE_BOARD = 'mutation ($name: String!) { create_board(board_name: $name, board_kind: private, empty: true) { id } }';
export const DELETE_BOARD = 'mutation ($board: ID!) { delete_board(board_id: $board) { id } }';
export const CREATE_COLUMN = 'mutation ($board: ID!, $id: String!, $title: String!, $type: ColumnType!, $defaults: JSON) { create_column(board_id: $board, id: $id, title: $title, column_type: $type, defaults: $defaults) { id type } }';
export const CREATE_ITEM = 'mutation ($board: ID!, $name: String!, $values: JSON) { create_item(board_id: $board, item_name: $name, column_values: $values) { id name } }';
export const DELETE_ITEM = 'mutation ($item: ID!) { delete_item(item_id: $item) { id } }';
export const CHANGE = 'mutation ($board: ID!, $item: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $item, column_values: $values) { id name } }';
export const CHANGE_WITH_LABELS = 'mutation ($board: ID!, $item: ID!, $values: JSON!) { change_multiple_column_values(board_id: $board, item_id: $item, column_values: $values, create_labels_if_missing: true) { id name } }';
export const READ_ITEM = 'query ($ids: [ID!]) { items(ids: $ids) { id state column_values(ids: ["status", "date4", "text"]) { id text value } } }';
export const ITEM_STATE = 'query ($ids: [ID!]) { items(ids: $ids) { id state } }';
export const STATUS_LABELS = 'query ($ids: [ID!]) { boards(ids: $ids) { columns(ids: ["status"]) { settings_str } } }';
export const ME = 'query { me { id name email } }';

// values of the item before each test
export const INITIAL = { status: 'Working on it', date: '2026-11-01', text: 'Initial text' };
export const INITIAL_VALUES = JSON.stringify({
  status: { label: INITIAL.status },
  date4: { date: INITIAL.date },
  text: INITIAL.text,
});
