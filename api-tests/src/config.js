// Values that change per environment. The token is never written in the code.
export const config = {
  baseUrl: process.env.MONDAY_URL || 'https://api.monday.com/v2',
  apiVersion: process.env.MONDAY_API_VERSION || '2025-04',
  token: process.env.MONDAY_TOKEN,
  invalidToken: 'invalid_token_123',
  maxResponseTime: Number(process.env.RESPONSE_TIME_LIMIT_MS || 1500),
  // each mutation costs 30,000 of the 1,000,000 points per minute
  delayBetweenTests: Number(process.env.DELAY_MS || 4000),
  fakeBaseUrl: 'https://dummyjson.com',
};
