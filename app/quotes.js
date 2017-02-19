'use strict';

const quotes = this;
const _ = require('underscore');

this.localDb = [];
this.repo = require('./repo/memory')([]);

const getLeastOccurrenceRandom = collection => {
  collection = _.sortBy(collection, quote => quote.occurrences);
  const first = _.first(collection);
  collection = _.filter(collection, quote => quote.occurrences == first.occurrences);

  if (_.isEmpty(collection)) {
    return;
  }

  const chosen = _.sample(collection);
  chosen.occurrences++;
  return chosen;
}

const repoFactory = (type, endpoint) => {
  switch (type) {
    case 'csv':
      return require('./repo/csv')(endpoint);
    case 'memory':
      return require('./repo/memory')(_.isArray(endpoint) ? endpoint : []);
    case 'redis':
      return require('./repo/redis')(endpoint);
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

      const quote = getLeastOccurrenceRandom(subset);

      if (quote === undefined) {
        accept();
      } else {
        accept({
          total: subset.length,
          quote: quote.item
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

const getById = id => {
  return _.find(quotes.localDb, (quote) => quote.item.id === id);
};

exports.getById = (id) => {
  return new Promise((accept, reject) => {
    try {
      const quote = getById(id);

      if (quote === undefined) {
        accept();
      } else {
        accept({
          quote: quote.item
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

exports.delete = (quote) => {
  return new Promise((accept, reject) => {
    try {
      const localDbQuoteInstance = _.find(quotes.localDb, item => item.item === quote);
      quotes.localDb = _.without(quotes.localDb, localDbQuoteInstance);
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

exports.patch = (existing_quote, patched_quote) => {
  return new Promise((accept, reject) => {
    try {
      const localDbQuoteInstance = _.find(quotes.localDb, item => item.item === existing_quote);
      localDbQuoteInstance.item.quote = patched_quote.quote;
      localDbQuoteInstance.item.update_by = patched_quote.update_by;
      localDbQuoteInstance.item.update_timestamp = Math.floor(+new Date() / 1000);
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
