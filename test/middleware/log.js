'use strict';

var httpMocks = require('node-mocks-http'),
  should = require('should'),
  sinon = require('sinon'),
  middleware = require('../../middleware/log');

describe('middleware/log', function () {
  var req, res, next, sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    middleware.methods.forEach(function (method) {
      sandbox.spy(console, method);
    });

    req = httpMocks.createRequest({ headers: { 'x-request-id': 'lx123' } });
    res = httpMocks.createResponse();
    next = sandbox.spy();

    middleware(req, res, next);
  });

  afterEach(function () {
    sandbox.restore();
  });

  middleware.methods.forEach(function (method) {
    describe(method, function () {
      it('should attach ' + method + ' method to the request', function () {
        should(req[method]);
        should.equal(typeof req[method], typeof Function);
      });

      it('should prepend the request id to message', function () {
        req[method]('facepalm');
        should(console[method].calledOnce);
        should(console[method].withArgs('lx123', 'facepalm').calledOnce);
      });
    });
  });

  it('should hand off control after log functions attached', function () {
    should.equal(next.calledOnce, true);
  });
});
