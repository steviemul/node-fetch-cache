const createResponse = (url, response, body) => {
  if (!response) {
    return null;
  }

  return Promise.resolve({
    ok: true,
    url,
    status: 200,
    statusText: 'OK',
    headers: response.headers,
    json: () => Promise.resolve(JSON.parse(body || response.body)),
    text: () => Promise.resolve(body || response.body)
  });
};

module.exports = {
  createResponse
};
