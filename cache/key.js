const crypto = require('crypto');
const config = require('../config');

module.exports = (key) => {
  if (config.cache.encodeKeys === true) {
    const hash = crypto.createHash('sha256');

    hash.update(key);

    return hash.digest('hex');
  }

  return key;
};
