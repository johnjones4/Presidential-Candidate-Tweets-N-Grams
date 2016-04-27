var config = require('./config');
var Twitter = require('./lib/twitter');
var Handle = require('./models/handle');
var Tweet = require('./models/tweet');
var NGram = require('./models/nGram');
var async = require('async');

var knex = require('knex')({
  'client': 'mysql',
  'connection': config.mysql
});

Handle.knex = knex;
Tweet.knex = knex;
NGram.knex = knex;

async.waterfall([
  function(next) {
    Handle.generateTable(function(err) {next(err)});
  },
  function(next) {
    NGram.generateTable(function(err) {next(err)});
  },
  function(next) {
    Tweet.generateTable(function(err) {next(err)});
  }
],function(err) {
  if (err) {
    console.error(err);
  } else {
    var twitter = new Twitter(config);
    twitter.start();
  }
});
