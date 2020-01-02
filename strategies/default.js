module.exports = {
  init: (options) => {
    this.options = options;
  },
  shouldCacheResponse: () => {
    return true;
  },
  getTTL: () => {
    return 0;
  },
  mustRevalidate: () => {
    return false;
  },
  staleWhileRevalidate: () => {
    return false;
  },
  etagSupport: () => {
    return false;
  },
};
