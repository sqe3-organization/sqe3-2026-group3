// Request manager (Singleton). Every HTTP request of the framework goes through this one instance.
const axios = require('axios');
const { config } = require('../utils/env');
const { logger } = require('./logger');

const BODY_LOG_LIMIT = 2000;
const short = (body) => {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return text && text.length > BODY_LOG_LIMIT ? `${text.slice(0, BODY_LOG_LIMIT)}...` : text;
};

class RequestManager {
  static #instance = null;
  static #creating = false;

  // returns always the same object
  static getInstance() {
    if (!RequestManager.#instance) {
      RequestManager.#creating = true;
      RequestManager.#instance = new RequestManager();
      RequestManager.#creating = false;
    }
    return RequestManager.#instance;
  }

  constructor() {
    if (!RequestManager.#creating) {
      throw new Error('RequestManager is a singleton, use RequestManager.getInstance()');
    }
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      headers: { 'Content-Type': 'application/json', ...config.api.headers },
      timeout: config.api.timeoutMs,
      // the tests check the status code, so 4xx and 5xx must not throw
      validateStatus: () => true,
    });
    logger.debug(`Request manager created for ${config.api.baseUrl} (env ${config.env})`);
  }

  // name: short text for the logs, for example the GraphQL operation
  async send({ method = 'post', url = '', data, headers = {}, name = url }) {
    const start = Date.now();
    logger.debug(`--> ${method.toUpperCase()} ${name} body: ${short(data)}`);
    let response;
    try {
      response = await this.client.request({ method, url, data, headers });
    } catch (error) {
      logger.error(`${method.toUpperCase()} ${name} failed without response: ${error.code || ''} ${error.message}`);
      throw error;
    }
    response.duration = Date.now() - start;

    logger.http(`${method.toUpperCase()} ${name} -> ${response.status} (${response.duration} ms)`, {
      status: response.status,
      duration: response.duration,
    });
    logger.debug(`<-- ${name} body: ${short(response.data)}`);
    if (response.status >= 500) logger.error(`${name} returned ${response.status}`);
    if (response.duration > config.maxResponseTimeMs) {
      logger.warn(`${name} took ${response.duration} ms, the limit is ${config.maxResponseTimeMs} ms`);
    }
    return response;
  }

  post(url, data, options = {}) {
    return this.send({ ...options, method: 'post', url, data });
  }

  get(url, options = {}) {
    return this.send({ ...options, method: 'get', url });
  }
}

module.exports = { RequestManager };
