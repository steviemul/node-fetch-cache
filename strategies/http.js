const CACHE_CONTROL = 'cache-control';
const PUBLIC = 'public';
const PRIVATE = 'private';
const MAX_AGE = 'max-age';
const S_MAX_AGE = 's-max-age';
const EXPIRES = 'expires';
const DATE = 'date';
const ETAG = 'etag';

const getHeaderValues = (headerValues) => {
  const values = {};

  headerValues.forEach((header) => {
    const parts = header.split(',');

    parts.forEach((part) => {
      const keyValues = part.trim().split('=');

      if (keyValues.length === 2) {
        values[keyValues[0]] = keyValues[1];
      } else if (keyValues.length === 1) {
        values[keyValues[0]] = true;
      }
    });
  });

  return values;
};

/**
 * Time to live is calcuated as S_MAX_AGE or MAX_AGE minus the current time
 * in seconds
 *
 * @param {*} headers
 * @return {number} the time to live in seconds
 */
const getTTL = (headers) => {
  const cacheControl = headers[CACHE_CONTROL];

  if (cacheControl) {
    const values = getHeaderValues(cacheControl);

    let maxAge = values[S_MAX_AGE];

    if (!maxAge) {
      maxAge = values[MAX_AGE];
    }

    if (!maxAge) {
      const expires = headers[EXPIRES];

      if (expires) {
        const expiresDate = new Date(expires[0]);

        const now = new Date();

        maxAge = (expiresDate.getTime() - now.getTime()) / 1000;
      }
    }

    return maxAge;
  }

  return 0;
};

module.exports = {
  init: (options) => {
    this.options = options;
  },
  shouldCacheResponse: (url, headers) => {
    let shouldCache = false;

    const cacheControl = headers[CACHE_CONTROL];

    if (cacheControl) {
      const values = getHeaderValues(cacheControl);

      // This means directives aimed at intermediary caches i.e. non browser caches
      if (this.options.supportSharedCacheDirectives !== false) {
        // only browsers may cache responses with "cache-control: private"
        if (values[PRIVATE]) {
          return false;
        }
      }

      // anything may cache responses with "cache-control: public"
      if (values[PUBLIC]) {
        shouldCache = true;
      }
    }

    // if we've gotten this far, we'll assume a response with an etag may be cached
    if (headers[ETAG]) {
      shouldCache = true;
    }

    if (this.options.force === true) {
      shouldCache = true;
    }

    return shouldCache;
  },
  mustRevalidate: (response) => {
    let revalidate = true;

    // an override to always use cached values
    if (this.options.always === true) {
      return false;
    }

    const cacheControl = response.headers[CACHE_CONTROL];

    if (cacheControl) {
      const dt = response.headers[DATE];

      if (dt) {
        const resourceDate = new Date(dt[0]);
        const ttl = getTTL(response.headers);

        const expiresDate = new Date(resourceDate.getTime() + (ttl * 1000));

        const now = new Date();

        if (now.getTime() < expiresDate.getTime()) {
          revalidate = false;
        }
      }
    }

    return revalidate;
  },
  staleWhileRevalidate: () => {
    return this.options.staleWhileRevalidate || false;
  },
  etagSupport: () => {
    return (this.options.etagSupport !== false) || false;
  },
  getTTL,
};
