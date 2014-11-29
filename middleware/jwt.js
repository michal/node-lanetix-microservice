(function () {
  'use strict';

  var Promise = require('bluebird'),
    jwt = require('jsonwebtoken'),
    boom = require('boom'),
    verifyToken = Promise.promisify(jwt.verify, jwt);

  module.exports = function (app) {
    return function (req, res, next) {
      var token = (req.get('authorization') || '').substring('Bearer '.length);

      if (!token || !token.length) {
        return res.boom.unauthorized();
      }

      verifyToken(token, app.get('options').jwtPublicKey, {
          issuer: 'urn:lanetix/auth',
          audience: 'urn:lanetix/api',
        })
        .then(function (user) {
          req.user = user;
        })
        .then(next)
        .catch(function (err) {
          console.error('Error verifying JWT: ', err);
          next(boom.forbidden());
        });
    };
  };

}());
