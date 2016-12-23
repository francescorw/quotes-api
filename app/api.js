'use strict';

const startedAt = new Date();
const logger = require('./logger');
const pkg = require('../package.json');
const settings = require('../config/settings');
const quotes = require('./quotes');

quotes.load({
  type: settings.database.type,
  endpoint: settings.database.endpoint
}).catch(err => {
  logger.error(err);
});

const _ = require('underscore');
const express = require('express');
const api = express.Router();

exports.router = api;

api.get('/', (req, res) => {
  res.json({
    version: pkg.version,
    since: startedAt
  });
});

api.post('/quotes', (req, res) => {
  const quote = req.body;
  const errors = [];

  if (!('nickname' in quote)) {
    errors.push('required: nickname');
  }

  if (!('mask' in quote)) {
    errors.push('required: mask');
  }

  if (!('channel' in quote)) {
    errors.push('required: channel');
  }

  if (!('quote' in quote)) {
    errors.push('required: quote');
  }

  if (!_.isEmpty(errors)) {
    return res.status(422).json({
      errors: errors
    });
  }

  quotes.add(quote).then(id => {
    logger.info('added quote with id ' + id);

    res.status(201).json({
      id: id
    });
  }).catch(() => {
    res.status(500).json({
      message: 'something bad happened'
    });
  });
});

api.get('/quotes/random', (req, res) => {
  const search = req.query;

  if (search.type === "wildcard" && search.query) {
    search.query = "^" + search.query.split("*").join(".*") + "$";
  }

  quotes.get(search.query).then(result => {

    if (_.isEmpty(result)) {
      res.status(404).json({
        message: 'quote not found'
      });
    } else {
      res.json({
        total: result.total,
        quote: result.quote.quote
      });
    }
  }).catch(() => {
    res.status(500).json({
      message: 'something bad happened'
    });
  });
});

api.get('/quotes/:id', (req, res) => {
  quotes.getById(req.params.id).then(result => {
    if (_.isEmpty(result)) {
      res.status(404).json({
        message: 'quote not found'
      });
    } else {
      res.json({
        quote: result.quote.quote
      });
    }

  }).catch(() => {
    res.status(500).json({
      message: 'something bad happened'
    });
  });
});

api.get('/quotes/:id/info', (req, res) => {
  quotes.getById(req.params.id).then(result => {

    if (_.isEmpty(result)) {
      res.status(404).json({
        message: 'quote not found'
      });
    } else {
      const info = {
        nickname: result.quote.nickname,
        timestamp: new Date(result.quote.timestamp * 1000),
        channel: result.quote.channel
      };

      res.json(info);
    }
  }).catch(() => {
    res.status(500).json({
      message: 'something bad happened'
    });
  });
});

api.delete('/quotes/:id', (req, res) => {
  quotes.getById(req.params.id).then(result => {
    if (result === undefined) {
      res.status(404).json({
        message: 'quote not found'
      });
    } else {
      quotes.delete(result.quote).then(result => {
        logger.info('added quote with id ' + req.params.id);
        res.json({
          success: true
        });
      });
    }
  }).catch(() => {
    res.status(500).json({
      success: false
    });
  });
});