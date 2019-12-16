module.exports = {
  createCache: (cacheType) => {
    const path = `./${cacheType}-cache`;

    return require(path);
  }
};

