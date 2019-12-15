const Redis = require('ioredis');
const config = require('../config');
const servers = config.cache.params.redis.servers;

const client = new Redis.Cluster(servers);

module.exports = {
  get: (key) => {
    return new Promise((resolve, reject) => {
      client.get(key, (err, result) => {
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
      client.set(key, serializedValue, 'EX', ttl);
    } else {
      client.set(key, serializedValue);
    }
  },
  disconnect: () => {
    client.disconnect();
  }
}
;
