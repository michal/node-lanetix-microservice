'use strict';

var cors = require('cors'),
  isLanetix = /\.lanetix\.com$/i,
  defaultExposedHeaders = [
    'X-Total-Count'
  ],
  corsConfig = {
    credentials: true,
    maxAge: 10 * 60 // this is the maximum we can cache in chrome
  };

module.exports = function (app) {
  var options = app.get('options');
  var corsOrigin = options.corsOrigin;

  // specify allowed origins
  if (corsOrigin) {
    if (Array.isArray(corsOrigin)) {
      corsConfig.origin = [isLanetix].concat(corsOrigin);
    } else if (typeof corsOrigin === 'function') {
      corsConfig.origin = function (origin, callback) {
        return isLanetix.test(origin)
          ? callback(null, true)
          : corsOrigin(origin, callback)
      }
    } else if (typeof corsOrigin !== 'string' || !isLanetix.test(corsOrigin)) {
      corsConfig.origin = corsOrigin === '*'
        ? corsOrigin
        : [isLanetix, corsOrigin];
    }
  }

  // specify allowed headers
  corsConfig.exposedHeaders = options.corsExposedHeaders || defaultExposedHeaders;

  return cors(corsConfig);
};
