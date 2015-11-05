var twitter = require('./lib/twitter');
var database = require('./lib/database');
var express = require('express');
var routes = require('./routes');
var logger = require('morgan');
var config = require('./config');

var app = express();
app.use(logger('combined'));
app.use(express.static(__dirname + '/public'));

app.get('/api/issues',routes.api.getIssues);
app.get('/api/tallies',routes.api.getTallies);
app.get('/api/members',routes.api.getMembers);

database.connect(function(err) {
  if (!err) {
    app.listen(config.express.port,function() {
      console.log('Server running.');
    });

    database.setupIssues(function(err,issues) {
      if (!err) {
        twitter.getHandles(function(err) {
          if (!err) {
            setInterval(function() {
              twitter.getNewTweets(issues);
            },6000);
          } else {
            console.log(err);
          }
        });
      } else {
        console.log(err);
      }
    })
  } else {
    console.log(err);
  }
});
