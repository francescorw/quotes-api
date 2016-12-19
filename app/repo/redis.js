const debug = require('debug')('redis');
const Redis = require('ioredis');

const helper = require('./helper');
const arrayToLocalDb = helper.arrayToLocalDb;
const mapDb = helper.mapDb;

const listKey = 'quotes';

module.exports = (address) => {
  const server = new Redis(address);

  server.on('error', (err) => {
    debug('redis error: ' + err);
  });

  server.on('connect', () => {
    debug('connected');
  });

  server.on('ready', () => {
    debug('ready');
  });

  this.load = () => {
    return server.lrange(listKey, 0, -1)
      .then((items) => {
        const quotes = items.map((item) => { return JSON.parse(item) });
        return arrayToLocalDb(quotes);
      });
  };

  this.add = (item) => {
    return server.rpush(listKey, JSON.stringify(item));
  };

  this.syncronize = (target) => {
    const mappedDb = mapDb(target);

    return server.del(listKey)
      .then(() => {
        const ops = [];

        mappedDb.forEach((item) => {
          ops.push(server.rpush(listKey, JSON.stringify(item)));
        });

        return Promise.all(ops);
      });
  };

  return this;
};
