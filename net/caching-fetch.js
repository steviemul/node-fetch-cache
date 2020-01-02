const fetch = require('node-fetch');
const {createCachedResponse} = require('./cache-helper');
const {createResponse} = require('./response-helper');
const {revalidate} = require('./revalidate-request');
const {createServices, getServices} = require('../services');
const logger = require('../logging/logger');
const createRevalidator = require('./revalidator');

const revalidator = createRevalidator(({url, response}) => {
  logger.debug(`Received response from worker for ${url}`);
  cache.set(url, response, response.expires);
});

const cachingFetch = (url, options) => {
  return fetch(url, options).then((response) => {
    const {cache, strategy} = getServices();

    if (response.ok) {
      const headers = response.headers.raw();

      if (strategy.shouldCacheResponse(url, headers)) {
        // clone the response for caching, so that the calling method can still read the response as normal
        const copy = response.clone();

        copy.text().then((body) => {
          const ttl = strategy.getTTL(headers);
          const cachedResponse = createCachedResponse(headers, body, ttl);

          cache.set(url, cachedResponse, ttl);
        });
      }
    }

    return response;
  });
};

async function getRevalidatedResponse(url, options, cachedResponse) {
  const response = await revalidate(url, options, cachedResponse);

  const {strategy} = getServices();

  cachedResponse.body = await response.text();
  cachedResponse.headers = response.headers.raw();
  cachedResponse.expires = strategy.getTTL(cachedResponse.headers);

  return cachedResponse;
};

const createFetch = (config) => {
  const {cache, strategy} = createServices(config);

  return async function(url, options = {}) {
    if (!cache.enabledForRequest(url, options)) {
      return fetch(url, options);
    }

    let cachedResponse = await cache.get(url);

    if (cachedResponse) {
      if (strategy.mustRevalidate(cachedResponse)) {
        if (strategy.staleWhileRevalidate() === true) {
          logger.debug(`Returning stale response for ${url}`);

          revalidator.revalidate(url, options, cachedResponse);
        } else {
          cachedResponse = await getRevalidatedResponse(url, options, cachedResponse);
          cache.set(url, cachedResponse, cachedResponse.expires);
        };
      }

      return createResponse(url, cachedResponse);
    }

    return cachingFetch(url, options, cache);
  };
};

const disconnect = () => {
  const {cache} = getServices();

  if (cache.disconnect) {
    cache.disconnect();
  }

  revalidator.exit();
};

module.exports = {
  createFetch,
  disconnect
};
