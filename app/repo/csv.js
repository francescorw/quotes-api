const fs = require('fs');
const stringify = require('csv-stringify');
const parse = require('csv-parse');
const helper = require('./helper');
const arrayToLocalDb = helper.arrayToLocalDb;
const mapDb = helper.mapDb;

module.exports = (filePath) => {
  if (!filePath) {
    throw 'filePath not provided';
  }

  const repo = this;
  repo.filePath = filePath;

  this.load = () => {
    return new Promise((accept, reject) => {
      fs.readFile(repo.filePath, (err, data) => {
        if (err)
          reject();

        parse(data, {
          columns: true
        }, (err, output) => {
          if (err)
            reject();

          accept(arrayToLocalDb(output));
        });
      });
    });
  }

  this.add = (item) => {
    return new Promise((accept, reject) => {
      stringify([item], {
        columns: ["timestamp", "nickname", "mask", "channel", "quote"],
        eof: false
      }, (err, output) => {
        fs.appendFile(repo.filePath, '\r\n' + output, (err) => {
          if (err)
            reject('cannot add quote');

          accept();
        });
      });
    });
  }

  this.syncronize = (target) => {
    return new Promise((accept, reject) => {
      const mappedDb = mapDb(target);

      stringify(mappedDb, {
        columns: ["timestamp", "nickname", "mask", "channel", "quote"],
        eof: false,
        header: true
      }, (err, output) => {
        fs.writeFile(repo.filePath, output, (err) => {
          if (err)
            reject('cannot syncronize with csv source');

          accept();
        });
      });
    });
  }

  return repo;
};