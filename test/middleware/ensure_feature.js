(function () {
  'use strict';

  var httpMocks = require('node-mocks-http'),
    should = require('should'),
    sinon = require('sinon'),
    middleware = require('../../middleware/ensure_feature');

  describe('middleware/ensure_feature', function () {
    var user = { features: { FEATURE_A: true, FEATURE_B: false } },
      req = httpMocks.createRequest({ user: user }),
      res = httpMocks.createResponse();

    req.user = user;

    it('should allow if user has feature', function () {
      var next = sinon.spy(function () {});

      middleware('FEATURE_A')(req, res, next);
      should.equal(next.calledOnce, true);
    });

    it('should not allow if feature is set to false', function () {
      middleware('FEATURE_B')(req, res);
      res.should.have.property('statusCode', 403);
    });

    it('should not allow if feature is not found', function () {
      middleware('FEATURE_C')(req, res);
      res.should.have.property('statusCode', 403);
    });

    it('should not allow if features not present on user object', function () {
      var featureless = {},
        request = httpMocks.createRequest(),
        response = httpMocks.createResponse();

      request.user = featureless;

      middleware('FEATURE_A')(request, response);
      response.should.have.property('statusCode', 403);
    });

    it('should not allow if user not present', function () {
      var request = httpMocks.createRequest(),
        response = httpMocks.createResponse();
      
      middleware('FEATURE_A')(request, response);
      response.should.have.property('statusCode', 403);
    });
  });
})();
