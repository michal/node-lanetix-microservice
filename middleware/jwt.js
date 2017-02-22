'use strict';

var BPromise = require('bluebird'),
  jwt = require('jsonwebtoken'),
  jwksRsa = require('jwks-rsa'),
  ms = require('ms'),
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

    var expiredJwt = function (err) {
      next(err);
      return res.status(401).send({
        error: 'TOKEN_EXPIRED'
      });
    };

    var allowAccess = function (user) {
      req.user = user;
      next();
    };

    return verifyToken(token, app.get('options').jwtPublicKey)
     .then(allowAccess)
     .catch(jwt.TokenExpiredError, expiredJwt)
     .catch(function () {
        var decodedToken = jwt.decode(token, { complete: true });
       //Checks if this is an Auth0 & valid token
        return getSigningKey(decodedToken.header.kid)
        .then(function (key) {
          return verifyToken(token, key.publicKey, {
            algorithms: ['RS256']
          });
        })
       .then(allowAccess);
      })
      .catch(next);
  };
};
