'use strict';

var cors = require('cors'),
  defaultExposedHeaders = [
    'X-Total-Count'
  ],
  corsConfig = {
    origin: /\.lanetix\.com$/i,
    credentials: true,
    maxAge: 10 * 60 // this is the maximum we can cache in chrome
  };

module.exports = function (app) {
  var options = app.get('options');
  var corsOrigin = options.corsOrigin;

  // specify allowed origins
  if (corsOrigin) {
    if (Array.isArray(corsOrigin)) {
      corsConfig.origin = corsOrigin.concat([corsConfig.origin]); // don't mutate
    } else if (typeof corsOrigin !== 'string' || !corsConfig.origin.test(corsOrigin)) {
      corsConfig.origin = [corsOrigin, corsConfig.origin];
    }
  }

  // specify allowed headers
  corsConfig.exposedHeaders = options.corsExposedHeaders || defaultExposedHeaders;

  return cors(corsConfig);
};
