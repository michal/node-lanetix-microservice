'use strict';

var keys = require('./keys');

module.exports = {
  jwtPublicKey: process.env.JWT_PUBLIC_KEY || keys[(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'test' : process.env.NODE_ENV].publicKey,
  corsOrigin: process.env.CORS_ORIGIN,
  isProduction: process.env.NODE_ENV === 'production'
};
