(function () {
  'use strict';

  var _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    keys = require('./keys');

  module.exports.sign = function (payload, options, cert) {
    return jwt.sign(payload || {}, cert || keys.development.privateKey, _.defaults({}, options || {}, {
        algorithm: 'RS256',
        issuer: 'urn:lanetix/auth',
        audience: 'urn:lanetix/api',
        subject: 'test',
        iat: (new Date().getTime() / 1000),
        expiresInMinutes: 2
      }));
  };

}());

