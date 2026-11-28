// Validates a response body against a JSON schema (Ajv).
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });
const compiled = new Map();

// returns the list of errors, empty when the body is valid
function validateSchema(schema, body) {
  if (!compiled.has(schema)) compiled.set(schema, ajv.compile(schema));
  const check = compiled.get(schema);
  return check(body) ? [] : check.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}

module.exports = { validateSchema };
