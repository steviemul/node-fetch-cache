const fetch = require('node-fetch');
const logger = require('../logging/logger');
const {getServices} = require('../services');
const {createResponse} = require('./response-helper');
const IF_NONE_MATCH = 'If-None-Match';
const IF_MODIFIED_SINCE = 'If-Modified-Since';
const ETAG = 'etag';
const LAST_MODIFIED = 'last-modified';
const NOT_MODIFIED = 304;

async function revalidate(url, options, cachedResponse) {
  logger.debug(`Revalidating ${url}`);

  const headers = options.headers || {};
  const {strategy} = getServices();

  if (strategy.etagSupport()) {
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
    logger.debug(`Resource ${url} not changed`);
    return createResponse(url, cachedResponse);
  } else {
    logger.debug(`Resource ${url} changed, returning fresh version`);
  }

  return response;
};

module.exports = {
  revalidate
};
