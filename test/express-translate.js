var expect = require('chai').expect;
var FixedServer = require('fixed-server');
var request = require('request');
var httpUtils = require('request-mocha')(request);

var fixedServer = FixedServer.fromFile('./test/fixtures/fixed-server', {
  port: 1337
});

describe('Loading a page that is translated with express-translate', function () {
  describe('when req.locale is set', function () {
    fixedServer.run(['GET 200 /#has-locale']);
    httpUtils.save('http://localhost:1337/');

    it('should translate strings in the view', function () {
      expect(this.body).to.contain('<p>Hello World</p>');
    });

    it('should allow translating from the request object', function () {
      expect(this.body).to.contain('<p>Hello Joe</p>');
    });
  });

  describe('when req.locale is undefined', function () {
    fixedServer.run(['GET 200 /#no-locale']);
    httpUtils.save('http://localhost:1337/');

    it('should display the translation key', function () {
      expect(this.body).to.eql('<p>hello</p><p>hello</p>');
    });
  });

  describe('when a localeKey setting is passed to express-translate', function () {
    fixedServer.run(['GET 200 /#locale-key']);
    httpUtils.save('http://localhost:1337/');

    it('should grab the user language from the specified key', function () {
      expect(this.body).to.eql('<p>Hello World</p><p>Hello Joe</p>');
    });
  });

  describe('when the translation has multiple placeholder keys of the same name', function () {
    fixedServer.run(['GET 200 /multiple-keys']);
    httpUtils.save('http://localhost:1337/multiple-keys');

    it('should interpolate values into both placeholders', function () {
      expect(this.body).to.eql('<p>You get a prize and you get a prize</p>');
    });
  });
});
