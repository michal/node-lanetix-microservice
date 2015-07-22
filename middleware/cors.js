'use strict';

var cors = require('cors'),
  defaultExposedHeaders = [
    'X-Total-Count'
  ],
  corsConfig = {
    credentials: true,
    maxAge: 10 * 60 // this is the maximum we can cache in chrome
  };

module.exports = function (app) {
  var options = app.get('options');

  // specify allowed origins
  if (app.get('options').corsOrigin) {
    corsConfig.origin = options.corsOrigin;
  }

  // specify allowed headers
  corsConfig.exposedHeaders = options.corsExposedHeaders || defaultExposedHeaders;

  return cors(corsConfig);
};
