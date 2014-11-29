(function () {
  'use strict';

  // add some helper methods to the response object
  module.exports = function () {
    return function (req, res, next) {

      res.created = function (obj) {
        res.status(201).json(obj);
      };

      res.empty = function () {
        res.status(204).send();
      };

      next();
    };
  };

}());

