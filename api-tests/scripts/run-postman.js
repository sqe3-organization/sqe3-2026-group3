// Runs a Postman collection with Newman. usage: node scripts/run-postman.js fake | monday
import newman from 'newman';

const name = process.argv[2] || 'fake';
const dir = '../postman/exports/';
const files = {
  fake: ['fake-api-dummyjson.postman_collection.json', 'fake-api.postman_environment.json'],
  monday: ['column-values.postman_collection.json', 'monday.postman_environment.json'],
};

newman.run({
  collection: dir + files[name][0],
  environment: dir + files[name][1],
  envVar: name === 'monday' ? [{ key: 'API_TOKEN', value: process.env.MONDAY_TOKEN }] : [],
  delayRequest: name === 'monday' ? 4000 : 0, // monday.com complexity budget
  reporters: ['cli', 'htmlextra'],
  reporter: { htmlextra: { export: `reports/newman-${name}.html`, skipSensitiveData: true } },
}, (err, summary) => {
  if (err) throw err;
  process.exitCode = summary.run.failures.length ? 1 : 0;
});
