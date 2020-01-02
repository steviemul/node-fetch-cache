const {createCache} = require('../cache');
const {createStrategy} = require('../strategies');

let cache;
let strategy;

module.exports = {
  createServices: (options) => {
    cache = createCache(options);
    strategy = createStrategy(options);

    return {
      cache,
      strategy
    };
  },
  getServices: () => {
    return {
      cache,
      strategy
    };
  }
};
