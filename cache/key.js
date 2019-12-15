const crypto = require('crypto');

module.exports = (key) => {
  const hash = crypto.createHash('sha256');

  hash.update(key);

  return hash.digest('hex');
};
