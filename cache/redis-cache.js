const Redis = require('ioredis');

module.exports = {
  init: (options) => {
    this.client = new Redis.Cluster(options.servers, {
      lazyConnect: true
    });
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
