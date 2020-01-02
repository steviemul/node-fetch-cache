module.exports = {
  init: (options) => {
    this.options = options;
  },
  disconnect: () => {

  },
  enabledForRequest: (url, options = {}) => {
    if (this.options.disabled === true || (options.method && options.method !== 'GET')) {
      return false;
    }

    return true;
  }
};
