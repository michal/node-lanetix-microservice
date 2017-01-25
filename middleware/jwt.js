'use strict';

var BPromise = require('bluebird'),
  boom = require('boom'),
  jwt = require('jsonwebtoken'),
  jwksRsa = require('jwks-rsa'),
  jwksRsaClient = jwksRsa({
    cache: true,
    cacheMaxAge: ms('5m'),
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://lanetix.auth0.com/.well-known/jwks.json'
  }),
  verifyToken = BPromise.promisify(jwt.verify, jwt),
  getSigningKey = BPromise.promisify(jwksRsaClient.getSigningKey, jwksRsaClient);

module.exports = function (app) {
  return function (req, res, next) {
    var token = (req.get('authorization') || '').substring('Bearer '.length) || req.query.access_token;

    req.encodedJwt = token;

    if (!token || !token.length) {
      return res.boom.unauthorized();
    }

    var user = BPromise.try(function () {
        return verifyToken(token, app.get('options').jwtPublicKey, {
            issuer: 'urn:lanetix/auth',
            audience: 'urn:lanetix/api'
          });
      })
      .catch(function () {
        var decodedToken = jwt.decode(token, { complete: true });
        return getSigningKey(decodedToken.header.kid)
          .then(function (key) {
            return verifyToken(token, key.publicKey, {
              algorithms: ['RS256']
            });
          });
      });

    BPromise.resolve(user)
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
