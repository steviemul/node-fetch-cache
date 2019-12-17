const {parentPort} = require('worker_threads');
const {createCachedResponse, getTTL} = require('./cache-helper');
const {createCache} = require('../cache');
const key = require('../cache/key');
const {revalidate} = require('./revalidate-request');
const logger = require('../logging/logger');

const cache = createCache('redis');

const throttled = (delay, fn) => {
  let lastCall = 0;
  return (...args) => {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
};

const handleRequest = (url, options, cachedResponse) => {
  revalidate(url, options, cachedResponse).then((response) => {
    response.text().then((body) => {
      const headers = response.headers.raw();
      const ttl = getTTL(headers);

      const revalidatedResponse = createCachedResponse(headers, body, ttl);

      cache.set(key(url), revalidatedResponse, revalidatedResponse.expires);

      logger.info(`Revalidated resource ${url} in worker`);
    });
  });
};

parentPort.on('message', (data) => {
  const {url, options = {}, cachedResponse} = data;

  setTimeout(() => {
    handleRequest(url, options, cachedResponse);
  }, 500);
});
