module.exports = (cache) => {
  return {
    hits: () => {
      return this.hits || 0;
    },
    misses: () => {
      return this.misses || 0;
    },
    get: (key) => {
      return new Promise((resolve) => {
        cache.get(key).then((result) => {
          if (result) {
            this.hits++;
          } else {
            this.misses++;
          }

          resolve(result);
        });
      });
    },
    set: (key, value, ttl) => {
      cache.set(key, value, ttl);
    },
    disconnect: () => {
      if (cache.disconnect) {
        cache.disconnect();
      }
    }
  };
};
