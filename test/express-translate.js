var express = require('express');
var expect = require('chai').expect;
var request = require('request');
var ExpressTranslate = require('../lib/express-translate');

describe('A express-translate library middleware', function () {
  function startServer (locale, options) {
    options = options || {};
    before(function () {
      var self = this;
      var expressTranslate = new ExpressTranslate(options);
      expressTranslate.addLanguage('en', { hello: 'Hello ${name}' });

      var app = express();
      app.set('views', 'test/fixtures');
      app.set('view engine', 'jade');
      app.use(function (req, res, next) {
        req[options.localeKey || 'locale'] = locale;
        next();
      });
      app.use(expressTranslate.middleware());
      app.use(function (req, res, next) {
        self.req = req;
        res.render('hello');
      });
      self.server = app.listen(9999);
    });
  }
  function saveRequest () {
    before(function (done) {
      var self = this;
      request('http://localhost:9999', function (err, res, body) {
        self.body = body;
        self.server.close();
        done(err);
      });
    });
  }

  describe('when the language exists', function () {
    startServer('en');
    saveRequest();

    it('should allow translating within view', function () {
      expect(this.body).to.eql('Hello World');
    });

    it('should allow translating from request object', function () {
      expect(this.req.t('hello', { name: 'Joe' })).equal('Hello Joe');
    });
  });

  describe('when the language does not exist', function () {
    startServer();
    saveRequest();

    it('should just return key', function () {
      expect(this.body).to.eql('hello');
    });
  });

  describe('when setting localeKey', function () {
    startServer('en', { localeKey: 'language' });
    saveRequest();

    it('should grab locale from new key', function () {
      expect(this.body).to.eql('Hello World');
    });
  });
});
