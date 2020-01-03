const statsCache = require('./stats-cache');
const loggingCache = require('./logging-cache');
const defaultConfig = require('../config');
const merge = require('../utils/merge');
const defaultImpl = require('./default-mixin');

module.exports = {
  createCache: (overrideConfig = {}) => {
    const config = merge(overrideConfig, defaultConfig);

    const cacheType = config.cache;
    const cacheOptions = config[cacheType] || {};

    const path = `./${cacheType}-cache`;

    defaultImpl.init(config);

    const cache = require(path);

    cache.init && cache.init(cacheOptions);

    const resultingCache = (config.logging === true) ?
      loggingCache(statsCache(cache)) :
      statsCache(cache);

    return {
      ...defaultImpl,
      ...resultingCache
    };
  }
};

