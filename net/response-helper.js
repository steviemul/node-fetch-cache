const {Response, Headers} = require('node-fetch');

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

module.exports = {
  createResponse
};
