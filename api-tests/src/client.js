import axios from 'axios';
import { config } from './config.js';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// validateStatus: the tests check the status code, so axios should not throw on 4xx
const monday = axios.create({
  baseURL: config.baseUrl,
  headers: { 'Content-Type': 'application/json', 'API-Version': config.apiVersion },
  validateStatus: () => true,
  timeout: 30000,
});

// save how long each request took
monday.interceptors.request.use((req) => {
  req.start = Date.now();
  return req;
});
monday.interceptors.response.use((res) => {
  res.duration = Date.now() - res.config.start;
  return res;
});

export function gql(query, variables = {}, { token = config.token } = {}) {
  return monday.post('', { query, variables }, { headers: { Authorization: token } });
}
