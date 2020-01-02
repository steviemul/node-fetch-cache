const defaultConfig = require('../config');
const merge = require('../utils/merge');
const defaultStrategy = require('./default');

const createStrategy = (overrideConfig) => {
  const config = merge(defaultConfig, overrideConfig || {});

  const strategyType = config.strategy;
  const strategyOptions = config[strategyType];

  const path = `./${strategyType}`;
  const strategy = require(path);

  defaultStrategy.init(config);

  strategy.init(strategyOptions);

  return {
    ...defaultStrategy,
    ...strategy
  };
};

module.exports = {
  createStrategy
};
