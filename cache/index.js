const redis = require('./redis-cache');
const mem = require('./mem-cache');
const disk = require('./disk-cache');

module.exports = {
  redis,
  mem,
  disk
};
