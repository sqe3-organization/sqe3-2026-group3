// Unit tests of the core layer. They use a local server, so they do not need monday.com or a token.
const http = require('node:http');
const { RequestManager } = require('../request-manager');

describe('RequestManager (Singleton)', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      const status = req.url === '/missing' ? 404 : 200;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ path: req.url, method: req.method }));
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(() => new Promise((resolve) => server.close(resolve)));

  test('getInstance always returns the same object', () => {
    expect(RequestManager.getInstance()).toBe(RequestManager.getInstance());
  });

  test('new RequestManager() is not allowed', () => {
    expect(() => new RequestManager()).toThrow('use RequestManager.getInstance()');
  });

  test('send returns the response with its duration', async () => {
    const res = await RequestManager.getInstance().post(`${baseUrl}/items`, { name: 'x' });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ path: '/items', method: 'POST' });
    expect(res.duration).toBeGreaterThanOrEqual(0);
  });

  test('a 404 does not throw, the test decides what to check', async () => {
    const res = await RequestManager.getInstance().get(`${baseUrl}/missing`);
    expect(res.status).toBe(404);
  });
});
