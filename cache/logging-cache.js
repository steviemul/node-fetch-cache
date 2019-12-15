const logger = require('../logging/logger');

module.exports = (cache) => {
  return {
    get: (key) => {
      return new Promise((resolve, reject) => {
        cache.get(key).then((result) => {
          if (result) {
            logger.info(`Cache hit on ${key}`);
          } else {
            logger.info(`Cache miss on ${key}`);
          }

          resolve(result);
        });
      });
    },
    set: (key, value, ttl) => {
      logger.info(`Caching value with key ${key}`);
      cache.set(key, value, ttl);
    },
    disconnect: () => {
      if (cache.disconnect) {
        cache.disconnect();
      }
    }
  };
};
