// Context of the scenario. Each feature has its own key, so the test asks for
// ctx.items.id or ctx.boards.id and never for a loose "id" variable.
// A new context is created for every test file and the item part is cleaned before each test.
function createContext() {
  return {
    boards: {},
    items: {},
    columnValues: {},
  };
}

module.exports = { createContext };
