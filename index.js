#!/usr/bin/env node

process.env.DEBUG = process.env.DEBUG || 'http,api,quotes';
const production = process.env.NODE_ENV === 'production';

const debug = require('debug')('http');
const express = require('express');
const morgan = require('morgan');
const winston = require('winston');
const bodyParser = require('body-parser');

const settings = require('./config/settings');
const quotes = require('./app/quotes');
const app = express();

app.use(bodyParser.json());

if (!production) {
  app.use(morgan('dev', {
    stream: {
      write: (str) => {
        debug(str.trim())
      },
    },
  }));
}

app.use(require('./app/api').router);
app.listen(settings.http.port, () => {
  debug('listening on port ' + settings.http.port);
});