'use strict';

const quotes = this;
const _ = require('underscore');

this.localDb = [];
this.repo = require('./repo/memory')([]);

const getLeastOccurrenceRandom = collection => {
  if (_.isEmpty(collection)) {
    return;
  }

  return _.sample(collection);
};

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
  try {
    quotes.repo = repoFactory(source.type, source.endpoint);
  } catch (err) {
    return Promise.reject(err);
  }

  return quotes.repo.load().then(data => {
    quotes.localDb = data;
  });
};

exports.add = (quote) => {
  quote.id = (quotes.localDb.length + 1).toString();
  quote.timestamp = Math.floor(+new Date() / 1000);

  quotes.localDb.push({
    item: quote
  });

  return quotes.repo.add(quote).then(() => {
    return quote.id;
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

exports.getById = (id) => {
  return new Promise((accept, reject) => {
    try {
      const quote = _.find(quotes.localDb, (quote) => quote.item.id === id);

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
  const localDbQuoteInstance = _.find(quotes.localDb, item => item.item === quote);
  quotes.localDb = _.without(quotes.localDb, localDbQuoteInstance);

  return quotes.repo.syncronize(quotes.localDb);
};

exports.patch = (existing_quote, patched_quote) => {
  const localDbQuoteInstance = _.find(quotes.localDb, item => item.item === existing_quote);
  localDbQuoteInstance.item.quote = patched_quote.quote;
  localDbQuoteInstance.item.update_by = patched_quote.update_by;
  localDbQuoteInstance.item.update_timestamp = Math.floor(+new Date() / 1000);

  return quotes.repo.syncronize(quotes.localDb);
};
