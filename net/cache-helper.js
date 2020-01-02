module.exports = {
  createCachedResponse: (headers, body, expires) => {
    return {
      headers,
      body,
      expires
    };
  }
};
