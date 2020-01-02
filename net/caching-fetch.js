const fetch = require('node-fetch');
const {createCache} = require('../cache');
const loggingCache = require('../cache/logging-cache');
const key = require('../cache/key');
const {createCachedResponse, shouldCacheResponse, getTTL, mustRevalidate} = require('./cache-helper');
const {createResponse} = require('./response-helper');
const {revalidate} = require('./revalidate-request');
const logger = require('../logging/logger');
const createRevalidator = require('./revalidator');

const config = require('../config');

let cache;

const revalidator = createRevalidator(({url, response}) => {
  logger.info(`Received response from worker for ${url}`);
  cache.set(key(url), response, response.expires);
});

const cachingFetch = (url, options, cache) => {
  return fetch(url, options).then((response) => {
    if (response.ok) {
      const headers = response.headers.raw();

      if (shouldCacheResponse(url, headers)) {
        // clone the response for caching, so that the calling method can still read the response as normal
        const copy = response.clone();

        copy.text().then((body) => {
          const ttl = getTTL(headers);
          const cachedResponse = createCachedResponse(headers, body, ttl);

          cache.set(key(url), cachedResponse, ttl);
        });
      }
    }

    return response;
  });
};

async function getRevalidatedResponse(url, options, cachedResponse) {
  const response = await revalidate(url, options, cachedResponse);

  cachedResponse.body = await response.text();
  cachedResponse.headers = response.headers.raw();
  cachedResponse.expires = getTTL(cachedResponse.headers);

  return cachedResponse;
};

const createFetch = (cacheType) => {
  cache = config.cache.logging ?
    loggingCache(createCache(cacheType || config.cache.type)) :
    createCache(cacheType || config.cache.type);

  return async function(url, options = {}) {
    if (config.cache.disabled === true || (options.method && options.method !== 'GET')) {
      return fetch(url, options);
    }

    let cachedResponse = await cache.get(key(url));

    if (cachedResponse) {
      if (mustRevalidate(cachedResponse)) {
        if (config.cache.staleWhileRevalidate === true) {
          logger.info(`Returning stale response for ${url}`);

          revalidator.revalidate(url, options, cachedResponse);
        } else {
          cachedResponse = await getRevalidatedResponse(url, options, cachedResponse);
          cache.set(key(url), cachedResponse, cachedResponse.expires);
        };
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

  revalidator.exit();
};

module.exports = {
  createFetch,
  disconnect
};
