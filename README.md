# express-translate [![Build Status](https://travis-ci.org/uber/express-translate.png?branch=master)](https://travis-ci.org/uber/express-translate)

Add simple translation support to Express

## Installation

```
npm install express-translate
```

## Usage

Initialize the middleware with:

``` js
var express = require('express'),
    ExpressTranslate = require('express-translate'),
    app = express();

var expressTranslate = new ExpressTranslate();
```

You'll then want to add a language or two to the translator:

``` js
expressTranslate.addLanguage('en', { hello: 'Hello ${name}' });
```

Finally, add the middleware to express:

``` js
app.use(expressTranslate.middleware());
```

By default, the middleware will read the current locale from `req.locale`; you
can alter this behavior by setting the `localeKey` option described below.
Then, within your code, you can translate a key using the translate function
at `req.t()` or within your template, like so:

``` jade
h1= t('hello', { name: 'Joe' });
```

## Options

#### localeKey

Specifies the key on the request object the locale can be found. Defaults
to `locale`.

#### interpolationPrefix

Specifies the prefix of the interpolation label for replacing content within
the string. Defaults to `${`.

#### interpolationSuffix

Specifies the suffix of the interpolation label for replacing content within
the string. Defaults to `}`.
