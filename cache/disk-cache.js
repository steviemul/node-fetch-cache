const fs = require('fs');
const path = require('path');
const key = require('../cache/key');

module.exports = {
  init: (options) => {
    this.options = options;
  },
  get: (id) => {
    let value;

    const location = path.join(this.options.location, key(id));

    if (fs.existsSync(location)) {
      value = JSON.parse(fs.readFileSync(location, 'utf8'));
    }

    return Promise.resolve(value);
  },
  set: (id, value) => {
    const serializedValue = JSON.stringify(value);
    const location = path.join(this.options.location, key(id));

    fs.writeFileSync(location, serializedValue, 'utf8');
  }
};
