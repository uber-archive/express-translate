var jade = require('jade');
var ExpressTranslate = require('../../../lib/express-translate');
var translations = require('../translations.js');

function serverSetup(req, res, next) {
  var app = req.app;
  app.engine('jade', jade.__express);
  app.set('view engine', 'jade');
  app.set('views', './test/fixtures/templates');
  next();
}

function setReqLocale(locale) {
  return function setReqLocaleMiddleware (req, res, next) {
    req.locale = locale;
    next();
  };
}

function expressTranslateSetup(options) {
  var expressTranslate = new ExpressTranslate(options);
  expressTranslate.addLanguage('en', translations.en);
  return expressTranslate.middleware();
}

exports['GET 200 /#has-locale'] = {
  method: 'get',
  route: '/',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup(),
    function (req, res) {
      res.render('index', {
        hello_joe: req.t('hello', {name: 'Joe'})
      });
    }
  ]
};

exports['GET 200 /#no-locale'] = {
  method: 'get',
  route: '/',
  response: [
    serverSetup,
    setReqLocale(),
    expressTranslateSetup(),
    function (req, res) {
      res.render('index', {
        hello_joe: req.t('hello', {name: 'Joe'})
      });
    }
  ]
};

exports['GET 200 /#locale-key'] = {
  method: 'get',
  route: '/',
  response: [
    serverSetup,
    function setReqLocale (req, res, next) {
      req.language = 'en';
      next();
    },
    expressTranslateSetup({localeKey: 'language'}),
    function (req, res) {
      res.render('index', {
        hello_joe: req.t('hello', {name: 'Joe'})
      });
    }
  ]
};

exports['GET 200 /multiple-keys'] = {
  method: 'get',
  route: '/multiple-keys',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup(),
    function (req, res) {
      res.render('multiple');
    }
  ]
};

exports['GET 200 /escape-values'] = {
  method: 'get',
  route: '/escape-values',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup(),
    function (req, res) {
      res.render('escape-values');
    }
  ]
};

exports['GET 200 /dont-escape-values'] = {
  method: 'get',
  route: '/escape-values',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup({escapeHtml: false}),
    function (req, res) {
      res.render('escape-values');
    }
  ]
};

exports['GET 200 /escape-key'] = {
  method: 'get',
  route: '/escape-key',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup(),
    function (req, res) {
      res.render('escape-key');
    }
  ]
};

exports['GET 200 /dont-escape-key'] = {
  method: 'get',
  route: '/escape-key',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup({escapeHtml: false}),
    function (req, res) {
      res.render('escape-key');
    }
  ]
};

exports['GET 200 /escape-translation'] = {
  method: 'get',
  route: '/escape-translation',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup(),
    function (req, res) {
      res.render('escape-translation');
    }
  ]
};

exports['GET 200 /dont-escape-translation'] = {
  method: 'get',
  route: '/escape-translation',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup({escapeHtml: false}),
    function (req, res) {
      res.render('escape-translation');
    }
  ]
};

exports['GET 200 /interpolation-setting'] = {
  method: 'get',
  route: '/interpolation-setting',
  response: [
    serverSetup,
    setReqLocale('en'),
    expressTranslateSetup({
      interpolationPrefix: '<',
      interpolationSuffix: '>'
    }),
    function (req, res) {
      res.render('interpolation-setting');
    }
  ]
};
