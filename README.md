# express-translate [![Build Status](https://travis-ci.org/uber/express-translate.png?branch=master)](https://travis-ci.org/uber/express-translate)

Adds translation support to [Express](http://expressjs.com/) by exposing a `t()`
function to both the `req` object and your views (using `res.locals`). It will
translate keys specified in an object mapping of `key => translation string` for
the languages that you specify. String interpolation is supported and all
[malicious content](#solved-xss-vulnerabilities) is html-escaped by default.

## Installation

```
npm install express-translate
```

## Usage

First, you'll want to instantiate express-translate:

``` js
var express = require('express');
var ExpressTranslate = require('express-translate');
var app = express();

var expressTranslate = new ExpressTranslate();
```

You'll then want to add a language or two to the translator. Translations are
stored in an object mapping of `key => translation string`:

``` js
expressTranslate.addLanguage('en', { hello: 'Hello ${name}' });
```

Finally, add the middleware to express:

``` js
app.use(expressTranslate.middleware());
```

By default, the middleware will read the current locale from `req.locale`; you
can alter this behavior by setting the `localeKey` option described below. A
locale **must be specified** on the `req` object in order for express-translate
to know which language it should translate the keys in. The locale must be the
same as those languages added to express-translate with `addLanguage()`.

Within your code, you can translate a key using the translate function
at `req.t()` or within your template. String interpolation with `key => value`
pairs are supported:

``` jade
h1= t('hello', { name: 'Joe' });
```

All html within the translations and interpolated values will be escaped. If
you wouldn't like to escape the html within an interpolated value, use the
`whitelistedKeys` option, passing an array of label names to disregard during escaping:

``` jade
h1= t('hello', { name: '<strong>Joe</strong>' }, { whitelistedKeys: ['name'] });
```

## Options

#### Constructor Options

``` js
new ExpressTranslate(options);
```

Pass an object to express-translate on instantiation with any of the following options:

- **localeKey** `String` Specifies the key on the request object the locale can
be found. Defaults to `locale`.
- **interpolationPrefix** `String` Specifies the prefix of the interpolation
key used to replace content within the string. Defaults to `${`.
- **interpolationSuffix** `String` Specifies the suffix of the interpolation
key used to replace content within the string. Defaults to `}`.
- **escapeHtml** `bool` Specifies whether to escape translations to prevent
 possible exploitation. Useful to disable if you already handle this in your workflow.
 Defaults to `true`.

#### `expressTranslate.addLanguage(code, translations)`

Adds an object of `key => translation string` to the translator for the specified
language.

- **code** `String` Specifies the locale code the translations are for (e.g. `en`).
- **translations** `Object` An object mapping of `key` to `translation string`
for the specified locale (e.g. `{ hello: 'Hello ${name}' }`).

#### `expressTranslate.addLanguages(codeTranslations)`

Helper for adding multiple languages in one go.

- **codeTranslations** `Object` An object mapping of `locale` to `translations object`
(e.g. `{ en: { hello: '${name}'} }`)

#### `req.t(key, interpolations, options)`

Translates the key with the language specified at `req.locale`.

- **key** `String` The key that you would like to translate (from the translations
object added with `addLanguage()`)
- **interpolations** `Object` An object mapping a key in the translation string
that should be replaced with the associated value. Values are html-escaped by
default; you can whitelist a key by using the `whitelistedKeys` option.
- **options** `Object` Options defined below:
  - **whitelistedKeys** `Array` An array of keys used for interpolation that should
  not be html-escaped by default

## Solved XSS Vulnerabilities

`express-translate`, by default, html-escapes translation strings, interpolation keys, and
interpolation values to prevent the following possible XSS vulnerabilities:

#### Malicious translations

If your translations are performed by malicious translators, they could contain
XSS attacks:

``` jade
// Define an translation with dynamic HTML content
!= t('welcome', {welcome_link: '<a href="/">' + user.name + '</a>'})

// Inside a translation
Hello <script>alert(1)</script>! Access your dashboard via ${welcome_link}
```

We prevent this by escaping the entire string:

``` jade
Hello &lt;script&gt;alert(1)&lt;/script&gt;! Access your dashboard via ${welcome_link}
```

#### Malicious keys

If the malicious translators are smart, then they can provide a bad key which
will not get replaced.

``` jade
Hello ${<script>alert(1)</script>}! Access your dashboard via ${welcome_link}
```

We prevent this by escaping the entire string:

``` jade
Hello ${&lt;script&gt;alert(1)&lt;/script&gt;}! Access your dashboard via ${welcome_link}
```

#### Malicious values

If the end user is being malicious, then they can provide a malicious value:

``` jade
// Normal translation execution
!= t('welcome', {welcome_link: '<a href="/">' + user.name + '</a>'})
Hello! Access your dashboard via ${welcome_link}

// With XSS attack
var user = {name: '<script>alert(1)</script>'};
// Hello! Access your dashboard via <a href="/"><script>alert(1)</script></a>
```

We prevent against this by escaping every value:

``` jade
Hello! Access your dashboard via &lt;a href=&quot;/&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;/a&gt;
```

Unfortunately, this has undesired side effects with HTML, so we provide a way
to trust specific interpolated values using the `whitelistedKeys` option:

``` jade
// Translate welcome link
- var welcome_link_text = t('welcome_link_text', {name: user.name})

// Translate welcome message
!= t('welcome', {welcome_link: '<a href="/">' + welcome_link_text + '</a>'}, {whitelistedKeys: ['welcome_link']})
```

yielding:

``` jade
Hello! Access your dashboard via <a href="/">&lt;script&gt;alert(1)&lt;/script&gt;</a>
```
