'use strict';

const quotes = this;
const _ = require('underscore');
const fs = require('fs');
const stringify = require('csv-stringify');
const parse = require('csv-parse');

let source = null;
let localDb = [];

const getLeastOccurrenceRandom = collection => {
  collection = _.sortBy(collection, quote => quote.occurrences);
  const first = _.first(collection);
  collection = _.filter(collection, quote => quote.occurrences == first.occurrences);

  if (_.isEmpty(collection)) {
    throw 'quote not found';
  }

  const chosen = _.sample(collection);
  chosen.occurrences++;
  return chosen;
}

const arrayToLocalDb = data => {
  return _.shuffle(_.map(data, (quote, index) => {
    quote.id = (index + 1).toString();
    return {
      occurrences: 1,
      item: quote
    };
  }));
}

const loadFromCsv = filePath => {
  return new Promise((accept, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err)
        reject();

      parse(data, {
        columns: true
      }, (err, output) => {
        if (err)
          reject();

        localDb = arrayToLocalDb(output);
        accept();
      });
    });
  });
}

const pushToSource = (source, item) => {
  return new Promise((accept, reject) => {
    if (source.type === 'csv') {
      stringify([item], {
        columns: ["timestamp", "nickname", "mask", "channel", "quote"],
        eof: false
      }, (err, output) => {
        fs.appendFile(source.endpoint, '\r\n' + output, (err) => {
          if (err)
            reject('cannot add quote');

          accept();
        });
      });
    } else if (source.type === 'memory') {
      try {
        source.endpoint.push(item);
        accept();
      } catch (err) {
        reject(err);
      }
    }
  });
}

const replaceSource = (source, localDb) => {
  return new Promise((accept, reject) => {
    let mappedDb = _.chain(localDb).map(item => item.item).sortBy(item => parseInt(item.id)).value();

    if (source.type === 'csv') {
      stringify(mappedDb, {
        columns: ["timestamp", "nickname", "mask", "channel", "quote"],
        eof: false,
        header: true
      }, (err, output) => {
        fs.writeFile(source.endpoint, output, (err) => {
          if (err)
            reject('cannot replace source');

          accept();
        });
      });
    } else if (source.type === 'memory') {
      try {
        source.endpoint.length = 0;
        _.each(mappedDb, quote => {
          source.endpoint.push(quote);
        });
        accept();
      } catch (err) {
        reject(err);
      }
    }
  });
};

exports.load = (source) => {
  return new Promise((accept, reject) => {

    quotes.source = source;

    if (source.type === 'csv') {
      loadFromCsv(source.endpoint).then(() => {
        accept();
      }).catch(() => {
        reject('cannot load quotes');
      })
    } else if (source.type === 'memory') {
      localDb = arrayToLocalDb(source.endpoint);
      accept();
    } else {
      throw 'not supported datasource';
    }
  });
};

exports.add = (quote) => {
  return new Promise((accept, reject) => {
    let id = (localDb.length + 1).toString();
    quote.id = id;
    quote.timestamp = Math.floor(+new Date() / 1000);
    localDb.push({
      occurrences: 1,
      item: quote
    });
    pushToSource(quotes.source, quote).then(() => {
      accept(id);
    }).catch(() => {
      reject('cannot add quote');
    });
  });
};

exports.get = (pattern) => {
  return new Promise((accept, reject) => {
    try {
      let subset = localDb;
      if (pattern) {
        const re = new RegExp(pattern);
        subset = _.filter(subset, (quote) => re.test(quote.item.quote));
      }
      accept({
        total: subset.length,
        quote: getLeastOccurrenceRandom(subset).item
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getById = id => {
  const quote = _.find(localDb, (quote) => quote.item.id === id);

  if (quote === undefined) {
    throw 'quote not found';
  }

  return quote;
};

exports.getById = (id) => {
  return new Promise((accept, reject) => {
    try {
      const quote = getById(id);
      accept({
        quote: quote.item
      });
    } catch (err) {
      reject(err);
    }
  });
};

exports.deleteById = (id) => {
  return new Promise((accept, reject) => {
    try {
      const quote = getById(id);
      localDb = _.without(localDb, quote);
      replaceSource(quotes.source, localDb).then(() => {
        accept();
      }).catch(err => {
        reject(err)
      });
    } catch (err) {
      reject(err);
    }
  });
};