'use strict';

exports.http = {
  port: 18111
};

exports.logging = {
  level: 'info',
  fileName: 'log/quotes.log'
}

exports.database = {
  type: 'csv', // redis
  endpoint: 'data/db.csv' // redis://server-host:6379
}
