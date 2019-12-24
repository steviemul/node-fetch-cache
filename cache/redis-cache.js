const Redis = require('ioredis');
const config = require('../config');
const servers = config.cache.params.redis.servers;

module.exports = {
  init: () => {
    this.client = new Redis.Cluster(servers);
  },
  get: (key) => {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, result) => {
        if (err) {
          reject(err);
        }

        resolve(JSON.parse(result));
      });
    });
  },
  set: (key, value, ttl) => {
    const serializedValue = JSON.stringify(value);

    if (ttl) {
      this.client.set(key, serializedValue, 'EX', ttl);
    } else {
      this.client.set(key, serializedValue);
    }
  },
  disconnect: () => {
    this.client.disconnect();
  }
};
