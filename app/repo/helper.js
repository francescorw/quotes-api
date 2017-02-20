const _ = require('underscore');

exports.arrayToLocalDb = data => {
  return _.shuffle(_.map(data, (quote, index) => {
    quote.id = (index + 1).toString();
    return {
      occurrences: 1,
      item: quote
    };
  }));
};

exports.mapDb = target => _.chain(target).map(item => item.item).sortBy(item => parseInt(item.id)).value();
