const CACHE = {};

module.exports = {
  get: (key) => {
    return Promise.resolve(CACHE[key]);
  },
  set: (key, value) => {
    CACHE[key] = value;
  }
};
