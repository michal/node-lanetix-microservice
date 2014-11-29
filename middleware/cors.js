(function () {
  'use strict';

  var cors = require('cors'),
    defaultExposedHeaders = [
      'X-Total-Count'
    ],
    corsConfig = {};

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

}());

