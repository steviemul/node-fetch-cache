const {createFetch, disconnect} = require('../net/caching-fetch');
const fetch = createFetch({cache: 'mem'});
const http = require('http');
const mockServer = require('mockserver');
let server;

beforeAll(() => {
  server = http.createServer(mockServer('tests/mocks')).listen(12080);
});

it('index.js returns a response', async () => {
  const indexResponse = await fetch('http://localhost:12080/data-response');
  const indexBody = await indexResponse.text();

  expect(indexBody).toBeDefined();
});

it('data.json returns a response', async () => {
  const dataResponse = await fetch('http://localhost:12080/data-response');
  const dataBody = await dataResponse.text();

  expect(dataBody).toBeDefined();
});

it('we get a cache hit', async () => {
  const dataResponse = await fetch('http://localhost:11080/static/index.js');
  const dataBody = await dataResponse.text();

  expect(dataBody).toBeDefined();
});

it('we get a stale cache hit', async () => {
  const dataResponse = await fetch('http://localhost:11080/static/data.json');
  const dataBody = await dataResponse.text();

  expect(dataBody).toBeDefined();
});

afterAll(() => {
  disconnect();
  server.close();
});

