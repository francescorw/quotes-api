'use strict';

const quotes = this;
const _ = require('underscore');

this.localDb = [];

const defaultDataSource = [];

this.repo = require('./quotesMemoryRepository')(defaultDataSource);

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

const repoFactory = (type, endpoint) => {
  switch (type) {
    case 'csv':
      return require('./quotesCsvRepository.js')(endpoint);
      break;
    case 'memory':
      return require('./quotesMemoryRepository.js')(endpoint);
      break;
    default:
      throw 'not supported datasource';
  }
};

exports.load = (source) => {
  return new Promise((accept, reject) => {
    quotes.repo = repoFactory(source.type, source.endpoint);

    quotes.repo.load().then(data => {
      quotes.localDb = data;
      accept();
    }).catch(() => reject('cannot load quotes'));
  });
};

exports.add = (quote) => {
  return new Promise((accept, reject) => {
    let id = (quotes.localDb.length + 1).toString();
    quote.id = id;
    quote.timestamp = Math.floor(+new Date() / 1000);
    quotes.localDb.push({
      occurrences: 1,
      item: quote
    });

    quotes.repo.add(quote).then(() => {
      accept(id);
    }).catch(() => {
      reject('cannot add quote');
    });
  });
};

exports.get = (pattern) => {
  return new Promise((accept, reject) => {
    try {
      let subset = quotes.localDb;
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
  const quote = _.find(quotes.localDb, (quote) => quote.item.id === id);

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
      quotes.localDb = _.without(quotes.localDb, quote);
      quotes.repo.syncronize(quotes.localDb).then(() => {
        accept();
      }).catch(err => {
        reject(err)
      });
    } catch (err) {
      reject(err);
    }
  });
};