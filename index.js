var twitter = require('./lib/twitter');
var database = require('./lib/database');
var express = require('express');
var routes = require('./routes');
var logger = require('morgan');

database.connect(function(err) {
  if (!err) {
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
})

var app = express();
app.use(logger('combined'));
app.use(express.static(__dirname + '/public'));

app.get('/api/issues',routes.api.getIssues);
app.get('/api/issue/:id',routes.api.getIssue);
app.get('/api/tallies',routes.api.getTallies);
app.get('/api/tally/:id',routes.api.getTally);
app.get('/api/members',routes.api.getMembers);
app.get('/api/member/:id',routes.api.getMmeber);

app.listen(config.express.port,function() {
  console.log('Server running.');
});
