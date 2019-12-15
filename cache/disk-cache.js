const fs = require('fs');
const path = require('path');
const config = require('../config');

const cacheLocation = config.cache.params.location;

module.exports = {
  get: (key) => {
    let value;

    const location = path.join(cacheLocation, key);

    if (fs.existsSync(location)) {
      value = JSON.parse(fs.readFileSync(location, 'utf8'));
    }

    return Promise.resolve(value);
  },
  set: (key, value) => {
    const serializedValue = JSON.stringify(value);
    const location = path.join(cacheLocation, key);

    fs.writeFileSync(location, serializedValue, 'utf8');
  }
};
