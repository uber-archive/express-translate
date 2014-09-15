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

  describe('when the translation has malicious interpolated values', function () {
    fixedServer.run(['GET 200 /escape-values']);
    httpUtils.save('http://localhost:1337/escape-values');

    it('should escape the html when `whitelistedKeys` is not set for the associated key', function () {
      expect(this.body).to.contain('<p>Hello &lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;</p>');
    });

    it('should not escape the html when `whitelistedKeys` is set for the associated key', function () {
      expect(this.body).to.contain('<p>Hello <script>alert("bye")</script>');
    });
  });

  describe('when the translation has malicious interpolation keys', function () {
    fixedServer.run(['GET 200 /escape-key']);
    httpUtils.save('http://localhost:1337/escape-key');

    it('should escape the key', function () {
      expect(this.body).to.eql('<p>Hello ${&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;}</p>');
    });
  });

  describe('when the translation has malicious content', function () {
    fixedServer.run(['GET 200 /escape-translation']);
    httpUtils.save('http://localhost:1337/escape-translation');

    it('should escape the translation html but not the interpolated values', function () {
      expect(this.body).to.contain('<p>&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; &lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;</p>');
      expect(this.body).to.contain('<p>&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; <script>alert("bye")</script>');
    });
  });

  describe('when a new interpolation prefix/suffix are defined in the settings', function () {
    describe('using html chars (< and >)', function () {
      fixedServer.run(['GET 200 /interpolation-setting']);
      httpUtils.save('http://localhost:1337/interpolation-setting');

      it('should interpolate values correctly', function () {
        expect(this.body).to.contain('<p>Hello World</p>');
      });
    });
  });

  describe('when the translation has malicious content with escaping disabled', function () {
    fixedServer.run(['GET 200 /dont-escape-translation']);
    httpUtils.save('http://localhost:1337/escape-translation');

    it('should not escape the translation html but not the interpolated values', function () {
      expect(this.body).to.contain('<p><script>alert("hi")</script> <script>alert("bye")</script></p>');
      expect(this.body).to.contain('<p><script>alert("hi")</script> <script>alert("bye")</script>');
    });
  });

  describe('when the translation has malicious interpolation keys', function () {
    fixedServer.run(['GET 200 /dont-escape-key']);
    httpUtils.save('http://localhost:1337/escape-key');

    it('should not escape the key', function () {
      expect(this.body).to.eql('<p>Hello ${<script>alert("hi")</script>}</p>');
    });
  });

  describe('when the translation has malicious interpolated values', function () {
    fixedServer.run(['GET 200 /dont-escape-values']);
    httpUtils.save('http://localhost:1337/escape-values');

    it('should escape the html when `whitelistedKeys` is not set for the associated key', function () {
      expect(this.body).to.contain('<p>Hello <script>alert("hi")</script></p>');
    });

    it('should not escape the html when `whitelistedKeys` is set for the associated key', function () {
      expect(this.body).to.contain('<p>Hello <script>alert("bye")</script>');
    });
  });
});
