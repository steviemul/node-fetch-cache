const fetch = require('node-fetch');
const {createCachedResponse} = require('./cache-helper');
const {createResponse} = require('./response-helper');
const {getRevalidatedResponse} = require('./revalidator');
const {createServices, getServices} = require('../services');
const queueRevalidate = require('./queue-revalidate');
const logger = require('../logging/logger');

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
          logger.debug(`Queuing revalidate response for ${url}`);

          queueRevalidate(url, options, cachedResponse, (revalidatedResponse) => {
            cache.set(url, revalidatedResponse, revalidatedResponse.expires);

            logger.debug(`Revalidated response for ${url}`);
          });
        } else {
          cachedResponse = await getRevalidatedResponse(url, options, cachedResponse);
          cache.set(url, cachedResponse, cachedResponse.expires);
        };
      }

      logger.debug(`Returning cached response for ${url}`);

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
};

module.exports = {
  createFetch,
  disconnect
};
