'use strict';

exports.http = {
  port: 18111
};

exports.logging = {
  level: 'info',
  fileName: 'log/quotes.log'
}

exports.database = {
  type: process.env.DBTYPE || 'csv',
  endpoint: process.env.DBENDPOINT || 'data/db.csv'
}