var fs = require('fs');
var quotemeta = require('quotemeta');
var extend = require('obj-extend');

function ExpressTranslate (settings) {
  this.translations = {};
  this.settings = extend({
    localeKey: 'locale',
    interpolationPrefix: '${',
    interpolationSuffix: '}'
  }, settings);
}

module.exports = ExpressTranslate;

/**
 * Adds key => value translations by language code to the translator
 * @param {String} code Language code (from req.locale)
 * @param {Object} translations A hash of translation strings keyed by label
 * @return {Object} this
 */
ExpressTranslate.prototype.addLanguage = function (code, translations) {
  this.translations[code] = translations;
  return this;
};

/**
 * Adds multiple translations to the translator
 * @param {Object} codeTranslations A hash of translation objects keyed by
 * language code
 * @return {Object} this
 */
ExpressTranslate.prototype.addLanguages = function (codeTranslations) {
  var self = this;
  var codes = Object.getOwnPropertyNames(codeTranslations);
  codes.forEach(function (code) {
    self.addLanguage(code, codeTranslations[code]);
  });
  return this;
};

/**
 * Substitutes the interpolation labels into a string with their
 * corresponding values
 * @param {String} string The string with interpolation labels to be replaced
 * @param {Object} interpolations A hash of values keyed by label to replace
 * in the string
 * @return {String} The altered string
 */
ExpressTranslate.prototype.interpolate = function (string, interpolations) {
  string = string || '';
  interpolations = interpolations || {};
  var intPrefix = this.settings.interpolationPrefix;
  var intSuffix = this.settings.interpolationSuffix;
  var labels = Object.getOwnPropertyNames(interpolations);
  labels.forEach(function (label) {
    var intLabel = intPrefix + label + intSuffix;
    var intPattern = new RegExp(quotemeta(intLabel), 'g');
    string = string.replace(intPattern, interpolations[label]);
  });
  return string;
};

/**
 * Translates the key in the corresponding language
 * @param {String} lang The language code to translate to (from req.locale)
 * @param {String} key The translation key to translate
 * @param {Object} interpolations A hash of the interpolations to replace
 * in the resulting translated string
 * @return {String} The translated string or the original key (if no
 * translations present for that language)
 */
ExpressTranslate.prototype.translate = function (lang, key, interpolations) {
  if (lang && this.translations[lang] && this.translations[lang][key]) {
    var translation = this.translations[lang][key];
    return this.interpolate(translation, interpolations);
  }
  return key;
};

/**
 * Returns a translate function solely for the specified language code
 * @param {String} lang The language code to translate to (from req.locale)
 * @return {Function} The translate function with an already specified
 * language code
 */
ExpressTranslate.prototype.translator = function (lang) {
  var self = this;
  return function expressTranslate (key, interpolations) {
    return self.translate(lang, key, interpolations);
  };
};

/**
 * Returns an express middleware that grabs the language code from req.locale
 * (or the key specified by the localeKey setting) and then adds the translate
 * function onto the request and response objects at req.t() and res.locals.t()
 * for the specified lanauge.
 * @return {Function} The middleware function
 */
ExpressTranslate.prototype.middleware = function () {
  var self = this;
  return function expressTranslateMiddleware (req, res, next) {
    var lang = req[self.settings.localeKey];
    var translateFunc = self.translator(lang);
    req.t = translateFunc;
    res.locals.t = translateFunc;
    next();
  };
};
