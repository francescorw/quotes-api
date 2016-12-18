'use strict';

const test = require('unit.js');
const quotes = require('../app/quotes');

describe('quotes', () => {
  before(done => {
    const data = [{
      nickname: 'Sarah',
      channel: '#thewhiteroom',
      mask: 'Sarah!agent@cia.gov',
      quote: '<Chuck> guys, I know kung fu'
    }, {
      nickname: 'samaritan',
      channel: '#nyc',
      mask: 'samaritan!admin@usa.gov',
      quote: '<Reese> geez, try not to die <Fusco> yeah i love you too'
    }, {
      nickname: 'kate',
      channel: '#lostandfound',
      mask: 'kate!kate@abc.go.com',
      quote: '<jack_ass> we have to go back'
    }];

    quotes.load(data).then(() => done()).catch(() => done(new Error()));
  });

  it('should add new quote', done => {
    const quote = {
      nickname: 'Ferdi',
      channel: '#support',
      mask: 'ferdi!big@brother',
      quote: '<piehdd> thats stupid <frw> so\'s your face man'
    };
    quotes.add(quote).then(result => {
      test.string(result).isNotEmpty();
      done();
    }).catch(() => done(new Error()));
  });

  it('should return random quote', done => {
    quotes.get().then(result => {
      test.string(result.quote.quote).isNotEmpty();
      done();
    }).catch(() => done(new Error()));
  });

  it('should return a quote containing \'yeah\'', done => {
    quotes.get('(yeah)').then(result => {
      test.string(result.quote.quote).isValid(/(yeah)/);
      done();
    }).catch(() => done(new Error()));
  });

  it('should not return a quote', done => {
    quotes.get('(fdsegewq)').catch(err => {
      test.string(err).isEqualTo('quote not found');
      done();
    });
  });

  it('should delete a quote', done => {
    quotes.deleteById("2").then(result => {
      quotes.getById("2").then().catch(err => {
        done();
      });
    }).catch(() => done(new Error()));
  });
});