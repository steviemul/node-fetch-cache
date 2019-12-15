const fetch = require('node-fetch');
const caches = require('../cache');
const loggingCache = require('../cache/logging-cache');
const key = require('../cache/key');
const {createCachedResponse, shouldCacheResponse, getTTL, mustRevalidate} = require('./cache-helper');
const {createResponse} = require('./response-helper');
const {revalidate} = require('./revalidate-request');

const config = require('../config');
const cache = loggingCache(caches[config.cache.type]);

const cachingFetch = (url, options, cache) => {
  return fetch(url, options).then((response) => {
    const headers = response.headers.raw();

    if (shouldCacheResponse(url, headers)) {
      const ttl = getTTL(headers);

      response
          .clone()
          .text()
          .then((value) => {
            const cachedResponse = createCachedResponse(headers, value, ttl);

            cache.set(key(url), cachedResponse, ttl);
          });
    }

    return response;
  });
};

const createFetch = () => {
  return async function(url, options = {}) {
    if (options.method && options.method !== 'GET') {
      return fetch(url, options);
    }

    const cachedResponse = await cache.get(key(url));

    if (cachedResponse) {
      if (mustRevalidate(cachedResponse)) {
        const response = await revalidate(url, options, cachedResponse);

        cachedResponse.body = await response.text();
        cachedResponse.headers = response.headers.raw();
        cachedResponse.expires = getTTL(cachedResponse.headers);

        cache.set(key(url), cachedResponse, cachedResponse.expires);
      }

      return createResponse(url, cachedResponse);
    }

    return cachingFetch(url, options, cache);
  };
};

const disconnect = () => {
  if (cache.disconnect) {
    cache.disconnect();
  }
};

module.exports = {
  createFetch,
  disconnect
};
