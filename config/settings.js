'use strict';

exports.http = {
  port: process.env.PORT || 18111
};

exports.logging = {
  level: process.env.LOGLEVEL || 'info',
  fileName: process.env.LOGFILE || 'log/quotes.log'
}

exports.database = {
  type: process.env.DBTYPE || 'redis',
  endpoint: process.env.DBENDPOINT || 'localhost:6397'
}