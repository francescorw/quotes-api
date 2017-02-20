const helper = require('./helper');
const _ = require('underscore');
const arrayToLocalDb = helper.arrayToLocalDb;
const mapDb = helper.mapDb;

module.exports = (dataSource) => {
  if (!dataSource) {
    throw 'dataSource not provided';
  }

  const repo = this;
  repo.dataSource = dataSource;

  this.load = () => {
    return new Promise((accept, reject) => {
      accept(arrayToLocalDb(dataSource));
    });
  };

  this.add = (item) => {
    return new Promise((accept, reject) => {
      try {
        repo.dataSource.push(item);
        accept();
      } catch (err) {
        reject(err);
      }
    });
  };

  this.syncronize = (target) => {
    return new Promise((accept, reject) => {
      try {
        const mappedDb = mapDb(target);
        repo.dataSource.length = 0;
        _.each(mappedDb, quote => {
          repo.dataSource.push(quote);
        });
        accept();
      } catch (err) {
        reject(err);
      }
    });
  };

  return repo;
};
