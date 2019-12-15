const fetch = require('node-fetch');
const logger = require('../logging/logger');
const {createResponse} = require('./response-helper');
const IF_NONE_MATCH = 'If-None-Match';
const IF_MODIFIED_SINCE = 'If-Modified-Since';
const ETAG = 'etag';
const LAST_MODIFIED = 'last-modified';
const NOT_MODIFIED = 304;

const config = require('../config');
const etagSupport = config.cache.etagSupport;

async function revalidate(url, options, cachedResponse) {
  logger.info(`Revalidating ${url}`);

  const headers = options.headers || {};

  if (etagSupport) {
    if (cachedResponse.headers[ETAG]) {
      headers[IF_NONE_MATCH] = cachedResponse.headers[ETAG][0];
    }

    if (cachedResponse.headers[LAST_MODIFIED]) {
      headers[IF_MODIFIED_SINCE] = cachedResponse.headers[LAST_MODIFIED][0];
    }
  }

  options.headers = headers;

  const response = await fetch(url, options);

  if (response.status === NOT_MODIFIED) {
    logger.info(`Resource ${url} not changed`);
    return createResponse(url, response, cachedResponse.body);
  } else {
    logger.info(`Resource ${url} changed, returning fresh version`);
  }

  return response;
};

module.exports = {
  revalidate
};
