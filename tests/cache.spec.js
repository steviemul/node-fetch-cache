const {createFetch, disconnect} = require('../net/caching-fetch');
const fetch = createFetch();

it('index.js returns a response', async () => {
  const indexResponse = await fetch('http://localhost:11080/static/index.js');
  const indexBody = await indexResponse.text();

  console.log(indexBody);

  expect(indexBody).toBeDefined();

  disconnect();
});

it('data.json returns a response', async () => {
  const dataResponse = await fetch('http://localhost:11080/static/data.json');
  const dataBody = await dataResponse.text();

  console.log(dataBody);

  expect(dataBody).toBeDefined();

  disconnect();
});

