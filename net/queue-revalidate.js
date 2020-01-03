const {getRevalidatedResponse} = require('./response-helper');

const QUEUE = new Set();
const LIMIT = 20;
const RATE = 500;
let TASKS = 0;

const revalidate = (url, options, cachedResponse, callback) => {
  if (!QUEUE.has(url) && TASKS <= LIMIT) {
    TASKS++;
    queueMicrotask(() => {
      getRevalidatedResponse(url, options, cachedResponse).then((revalidatedResponse) => {
        callback(revalidatedResponse);

        setTimeout(() => {
          TASKS--;
          QUEUE.delete(url);
        }, RATE);
      });
    });
  }
};

module.exports = revalidate;
