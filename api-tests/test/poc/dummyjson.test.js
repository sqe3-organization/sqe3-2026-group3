// Proof of concept: axios + Mocha + Chai + Ajv against DummyJSON (same API used in Lab 2)
import axios from 'axios';
import { expect } from 'chai';
import Ajv from 'ajv';
import { config } from '../../src/config.js';

const api = axios.create({ baseURL: config.fakeBaseUrl, validateStatus: () => true });
const ajv = new Ajv();
const productSchema = {
  type: 'object',
  required: ['id', 'title', 'price'],
  properties: { id: { type: 'integer' }, title: { type: 'string' }, price: { type: 'number', minimum: 0 } },
};

describe('PoC - DummyJSON', function () {
  let token;

  // hook: log in once before the tests of this suite
  before(async function () {
    const res = await api.post('/auth/login', { username: 'emilys', password: 'emilyspass' });
    expect(res.status).to.equal(200);
    token = res.data.accessToken;
  });

  it('TC-FAKE-001 List products returns the requested page', async function () {
    const start = Date.now();
    const res = await api.get('/products', { params: { limit: 5, select: 'title,price' } });
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('application/json');
    expect(Date.now() - start).to.be.below(1000);
    expect(res.data.products).to.be.an('array').with.lengthOf(5);
    expect(res.data.limit).to.equal(5);
    res.data.products.forEach((p) => expect(ajv.validate(productSchema, p), JSON.stringify(ajv.errors)).to.be.true);
  });

  it('TC-FAKE-002 Get product 1 returns that product', async function () {
    const res = await api.get('/products/1');
    expect(res.status).to.equal(200);
    expect(res.data).to.include({ id: 1 });
    expect(res.data.title).to.be.a('string').and.not.empty;
  });

  it('TC-FAKE-003 Get a product that does not exist returns 404', async function () {
    const res = await api.get('/products/999999');
    expect(res.status).to.equal(404);
    expect(res.data.message).to.match(/not found/i);
  });

  it('TC-FAKE-004 Create a product returns the new id', async function () {
    const res = await api.post('/products/add', { title: 'AT - Lab 3 test product', price: 10 });
    expect(res.status).to.equal(201);
    expect(res.data).to.include({ title: 'AT - Lab 3 test product', price: 10 });
    expect(res.data.id).to.be.a('number');
  });

  it('TC-FAKE-009 Get current user with bearer token returns the user', async function () {
    const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).to.equal(200);
    expect(res.data.username).to.equal('emilys');
  });

  it('TC-FAKE-010 Get current user with an invalid token returns 401', async function () {
    const res = await api.get('/auth/me', { headers: { Authorization: 'Bearer invalid_token_123' } });
    expect(res.status).to.equal(401);
    expect(res.data.message).to.match(/token/i);
  });
});
