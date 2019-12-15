const {createFetch, disconnect} = require('./net/caching-fetch');
const fetch = createFetch();

async function run() {
  const indexResponse = await fetch('http://localhost:11080/static/index.js');
  const indexBody = await indexResponse.text();

  console.log(indexBody);

  const dataResponse = await fetch('http://localhost:11080/static/data.json');
  const dataBody = await dataResponse.text();

  console.log(dataBody);

  disconnect();
}

run();
