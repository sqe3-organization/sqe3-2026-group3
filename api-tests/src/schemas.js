import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const str = { type: 'string' };
const obj = (required, properties) => ({ type: 'object', required, properties });

const schemas = {
  changeOk: {
    ...obj(['data'], {
      data: obj(['change_multiple_column_values'], {
        change_multiple_column_values: obj(['id', 'name'], { id: { type: 'string', pattern: '^[0-9]+$' }, name: str }),
      }),
    }),
    not: { required: ['errors'] },
  },
  errorResponse: obj(['errors'], {
    errors: { type: 'array', minItems: 1, items: obj(['message'], { message: str, extensions: obj([], { code: str }) }) },
  }),
  item: obj(['id', 'state', 'column_values'], {
    id: str,
    state: { enum: ['active', 'archived', 'deleted'] },
    column_values: {
      type: 'array',
      items: obj(['id', 'text', 'value'], { id: str, text: { type: ['string', 'null'] }, value: { type: ['string', 'null'] } }),
    },
  }),
  me: obj(['data'], { data: obj(['me'], { me: obj(['id', 'name', 'email'], { id: str, name: str, email: str }) }) }),
};

// returns the schema errors, empty when the body is valid
export function validate(name, body) {
  const check = ajv.compile(schemas[name]);
  return check(body) ? [] : check.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}
