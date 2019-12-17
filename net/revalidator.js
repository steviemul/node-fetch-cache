const {Worker} = require('worker_threads');
const path = require('path');

const revalidateWorker = new Worker(path.join(__dirname, 'revalidate-worker.js'));

module.exports = (callback) => {
  revalidateWorker.on('message', (data) => {
    callback(data);
  });

  return {
    revalidate: (url, options, cachedResponse) => {
      revalidateWorker.postMessage({
        url,
        options,
        cachedResponse
      });
    },
    exit: () => {
      revalidateWorker.terminate();
    }
  };
};
