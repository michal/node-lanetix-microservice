(function () {
  'use strict';

  var fs = require('fs'),
    util = require('util'),
    jwtPublicKeyPath = __dirname + util.format('/keys/%s/public_key.pem', process.env.NODE_ENV || 'development');

  module.exports = {
    jwtPublicKey: process.env.JWT_PUBLIC_KEY || fs.readFileSync(jwtPublicKeyPath),
    corsOrigin: process.env.CORS_ORIGIN,
    isProduction: process.env.NODE_ENV === 'production'
  };

}());

