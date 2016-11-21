'use strict';

var BPromise = require('bluebird'),
  jwt = require('jsonwebtoken'),
  boom = require('boom'),
  verifyToken = BPromise.promisify(jwt.verify, jwt);

module.exports = function (app) {
  return function (req, res, next) {
    var token = (req.get('authorization') || '').substring('Bearer '.length) || req.query.access_token;

    req.encodedJwt = token;

    if (!token || !token.length) {
      return res.boom.unauthorized();
    }

    verifyToken(token, app.get('options').jwtPublicKey, {
        issuer: 'urn:lanetix/auth',
        audience: 'urn:lanetix/api'
      })
      .then(function (user) {
        req.user = user;
      })
      .then(next)
      .catch(function (err) {
        if (err && err instanceof jwt.TokenExpiredError) {
          return res.format({
            json: function () {
              res.status(401).json({
                error: 'TOKEN_EXPIRED'
              });
            },

            html: function () {
              next(err);
            }
          });
        } else {
          req.error('Error verifying JWT: ', err);
          next(boom.forbidden());
        }
      });
  };
};
