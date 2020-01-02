const {parentPort} = require('worker_threads');
const {createCachedResponse} = require('./cache-helper');
const {getServices} = require('../services');
const {revalidate} = require('./revalidate-request');
const logger = require('../logging/logger');

const handleRequest = (url, options, cachedResponse) => {
  const {cache, strategy} = getServices();

  revalidate(url, options, cachedResponse).then((response) => {
    response.text().then((body) => {
      const headers = response.headers.raw();
      const ttl = strategy.getTTL(headers);

      const revalidatedResponse = createCachedResponse(headers, body, ttl);

      cache.set(url, revalidatedResponse, revalidatedResponse.expires);

      logger.debug(`Revalidated resource ${url} in worker`);
    });
  });
};

parentPort.on('message', (data) => {
  const {url, options = {}, cachedResponse} = data;

  setTimeout(() => {
    handleRequest(url, options, cachedResponse);
  }, 500);
});
