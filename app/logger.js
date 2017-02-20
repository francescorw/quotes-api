'use strict';

const winston = require('winston');
const settings = require('../config/settings');
const fs = require('fs');
const path = require('path');
const directory = path.dirname(settings.logging.fileName);

fs.existsSync(directory) || fs.mkdirSync(directory);

module.exports = new(winston.Logger)({
  transports: [
    new(winston.transports.File)({
      filename: settings.logging.fileName,
      level: settings.logging.level,
      json: false,
      timestamp: () => new Date().toISOString(),
      formatter: (options) => {
        return [options.timestamp(), options.level.toUpperCase(), options.message || ''].join(' ');
      }
    })
  ]
});
