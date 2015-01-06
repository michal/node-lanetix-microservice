'use strict';

module.exports = function (feature) {
  return function (req, res, next) {
    if (req.user && req.user.features && req.user.features[feature]) {
      return next();
    }

    res.status(403).send();
  };
};
