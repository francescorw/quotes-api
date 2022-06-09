#!/usr/bin/env node

require('dotenv').config({silent: true});

const settings = require('./config/settings');
const production = process.env.NODE_ENV === 'production';

const debug = require('debug')('http');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use(morgan(production ? 'combined' : 'dev', {
  stream: {
    write: (str) => {
      debug(str.trim());
    },
  },
}));

app.use(require('./app/api').router);
app.listen(settings.http.port, () => {
  debug('listening on port ' + settings.http.port);
});
