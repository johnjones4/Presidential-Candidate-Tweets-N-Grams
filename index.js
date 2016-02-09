var config = require('./config');
var models = require('./models');
var mongoose = require('mongoose');
var Twitter = require('./lib/twitter');

var Issue = mongoose.model('Issue');

mongoose.connect(config.mongo.connection_string);

Issue.initializeIssues(function(err,issues) {
  if (err) {
    console.error(err);
  } else {
    var twitter = new Twitter(config,issues);
    twitter.start();
  }
});
