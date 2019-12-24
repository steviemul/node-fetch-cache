const statsCache = require('./stats-cache');

module.exports = {
  createCache: (cacheType, options) => {
    const path = `./${cacheType}-cache`;

    const cache = require(path);

    cache.init && cache.init(options);

    return statsCache(cache);
  }
};

