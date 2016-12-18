#!/usr/bin/env node

process.env.DEBUG = process.env.DEBUG || 'http';
const production = process.env.NODE_ENV === 'production';
const port = process.env.PORT || settings.http.port;

const debug = require('debug')('http');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const settings = require('./config/settings');
const app = express();

app.use(bodyParser.json());

app.use(morgan(production ? 'combined' : 'dev', {
  stream: {
    write: (str) => {
      debug(str.trim())
    },
  },
}));

app.use(require('./app/api').router);
app.listen(port, () => {
  debug('listening on port ' + port);
});