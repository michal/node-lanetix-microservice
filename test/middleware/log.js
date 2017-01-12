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

    req = httpMocks.createRequest({
      headers: { 'x-request-id': 'lx123' },
      user: { id: 1337, organization_id: 42 }
    });

    res = httpMocks.createResponse();
    next = sandbox.spy();

    middleware(req, res, next);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('authenticated', function () {
    middleware.methods.forEach(function (method) {
      describe(method, function () {
        beforeEach(function () {
          req[method]('facepalm');
        });

        it('should attach ' + method + ' method to the request', function () {
          should(req[method]);
          should.equal(typeof req[method], typeof Function);
        });

        it('should call underlying method', function () {
          should(console[method].calledOnce);
        });

        it('should prepend the request id to message', function () {
          should.equal(console[method].getCall(0).args[0], 'req: lx123');
        });

        it('should prepend organization id to message', function () {
          should.equal(console[method].getCall(0).args[1], 'org: 42');
        });

        it('should prepend user id to message', function () {
          should.equal(console[method].getCall(0).args[2], 'user: 1337');
        });

        it('should pass original arguments', function () {
          should.equal(console[method].getCall(0).args[3], 'facepalm');
        });
      });
    });

    it('should hand off control after log functions attached', function () {
      should.equal(next.calledOnce, true);
    });
  });

  describe('unauthenticated', function () {
    middleware.methods.forEach(function (method) {
      beforeEach(function () {
        req.user = undefined;
        req[method]('facepalm');
      });

      it('should call underlying method', function () {
        should(console[method].calledOnce);
      });

      it('should prepend the request id to message', function () {
        should.equal(console[method].getCall(0).args[0], 'req: lx123');
      });

      it('should not prepend user or organzation id to the message', function () {
        should.equal(console[method].getCall(0).args[1], 'facepalm');
      });
    });
  });
});
