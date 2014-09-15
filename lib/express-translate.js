var escapeHtml = require('escape-html');
var extend = require('obj-extend');
var quotemeta = require('quotemeta');

function ExpressTranslate(settings) {
  this.translations = {};
  this.settings = extend({
    localeKey: 'locale',
    interpolationPrefix: '${',
    interpolationSuffix: '}',
    escapeHtml: true
  }, settings);
}

module.exports = ExpressTranslate;

/**
 * Adds key => value translations by language code to the translator
 * @param {String} code Language code (from req.locale)
 * @param {Object} translations A hash of translation strings with associated key
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
  codes.forEach(function addLanguageTranslations (code) {
    self.addLanguage(code, codeTranslations[code]);
  });
  return this;
};

/**
 * Substitutes the interpolation keys into a string with their
 * corresponding values
 * @param {String} string The string with interpolation keys to be replaced
 * @param {Object} interpolations A hash of keys => values to replace
 * in the string
 * @return {String} The altered string
 */
ExpressTranslate.prototype.interpolate = function (string, interpolations, options) {
  interpolations = interpolations || {};
  options = options || {};

  var escape = this.settings.escapeHtml ? escapeHtml : function (s) { return s; };

  // Escape any html within the translation string
  string = escape(string || '');

  // Escape (if configured) the interpolation prefix/suffix settings
  // so that they can still match the now-escaped translation string
  var intPrefix = escape(this.settings.interpolationPrefix);
  var intSuffix = escape(this.settings.interpolationSuffix);

  // Store the whitelisted keys on an object for performant searches
  var whitelistedKeys = {};
  options.whitelistedKeys = options.whitelistedKeys || [];
  options.whitelistedKeys.forEach(function storeWhitelistedKeys(key) {
    whitelistedKeys[key] = true;
  });

  // Interpolate the values into the translation string
  var keys = Object.getOwnPropertyNames(interpolations);
  keys.forEach(function interpolateTranslationValues(key) {
    // Create regex key pattern for replacement
    var intKey = intPrefix + key + intSuffix;
    var intPattern = new RegExp(quotemeta(intKey), 'g');

    // Escape html within the values unless key is specifically whitelisted
    var value = interpolations[key];
    var intValue = whitelistedKeys[key] ? value : escape(value);

    // Replace the keys with the interpolation values
    string = string.replace(intPattern, intValue);
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
ExpressTranslate.prototype.translate = function (lang, key, interpolations, options) {
  if (lang && this.translations[lang] && this.translations[lang][key]) {
    var translation = this.translations[lang][key];
    return this.interpolate(translation, interpolations, options);
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
  return function expressTranslate(key, interpolations, options) {
    return self.translate(lang, key, interpolations, options);
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
  return function expressTranslateMiddleware(req, res, next) {
    var lang = req[self.settings.localeKey];
    var translateFunc = self.translator(lang);
    req.t = translateFunc;
    res.locals.t = translateFunc;
    next();
  };
};
