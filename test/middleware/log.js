'use strict';

var httpMocks = require('node-mocks-http'),
  should = require('should'),
  sinon = require('sinon'),
  middleware = require('../../middleware/log');

describe('middleware/log', function () {
  var req, res, next, sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    sandbox.spy(console, 'error');
    sandbox.spy(console, 'log');
    sandbox.spy(console, 'warn');

    req = httpMocks.createRequest({ headers: { 'x-request-id': 'lx123' } });
    res = httpMocks.createResponse();
    next = sandbox.spy();

    middleware(req, res, next);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('error', function () {
    it('should attach a error method to the request', function () {
      should(req.error);
      should.equal(typeof req.error, typeof Function);
    });

    it('should prepend the request id to message', function () {
      req.error('facepalm');
      should(console.error.calledOnce);
      should(console.error.withArgs('lx123', 'facepalm').calledOnce);
    });
  });

  describe('log', function () {
    it('should attach a log method to the request', function () {
      should(req.log);
      should.equal(typeof req.log, typeof Function);
    });

    it('should prepend the request id to message', function () {
      req.log('logger');
      should.equal(console.log.calledOnce, true);
      should(console.log.withArgs('lx123', 'facepalm').calledOnce);
    });
  });

  describe('warn', function () {
    it('should attach a warn method to the request', function () {
      should(req.warn);
      should.equal(typeof req.warn, typeof Function);
    });

    it('should prepend the request id to message', function () {
      req.warn('danger');
      should.equal(console.warn.calledOnce, true);
      should(console.warn.withArgs('lx123', 'danger').calledOnce);
    });
  });

  it('should hand off control after log functions attached', function () {
    should.equal(next.calledOnce, true);
  });
});
