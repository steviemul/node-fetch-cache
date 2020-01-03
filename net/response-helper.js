const {Response, Headers} = require('node-fetch');
const {getServices} = require('../services');
const {revalidate} = require('./revalidate-request');

const createResponse = (url, response, body) => {
  if (!response) {
    return null;
  }

  const fetchResponse = new Response(body || response.body, {
    status: 200,
    statusText: 'OK',
    headers: new Headers(response.headers)
  });

  return Promise.resolve(fetchResponse);
};

async function getRevalidatedResponse(url, options, cachedResponse) {
  const response = await revalidate(url, options, cachedResponse);

  const {strategy} = getServices();

  cachedResponse.body = await response.text();
  cachedResponse.headers = response.headers.raw();
  cachedResponse.expires = strategy.getTTL(cachedResponse.headers);

  return cachedResponse;
};

module.exports = {
  createResponse,
  getRevalidatedResponse
};
