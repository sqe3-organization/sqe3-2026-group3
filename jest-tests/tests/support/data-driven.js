// Runs the same steps for every row of a dataset.
// Rows with "knownBug" run with test.failing: they pass while the bug exists
// and fail the day monday.com fixes it, so we know we have to update the dataset.
function eachRow(rows, title, steps) {
  const normal = rows.filter((row) => !row.knownBug);
  const withBug = rows.filter((row) => row.knownBug);
  if (normal.length) test.each(normal)(title, steps);
  if (withBug.length) test.failing.each(withBug)(`${title} [$knownBug]`, steps);
}

module.exports = { eachRow };
